from autobahn.twisted.websocket import WebSocketServerProtocol, WebSocketServerFactory
from twisted.internet import reactor, defer
from twisted.internet.threads import deferToThread
import requests
import json
from collections import deque
import time
import argparse
import threading


class CircularBuffer:
    def __init__(self, maxlen):
        self.data = deque(maxlen=maxlen)

    def append(self, value):
        self.data.append(value)

    def get_oldest(self):
        return self.data[0] if self.data else None

    def get_newest(self):
        return self.data[-1] if self.data else None


with open(".nodes.json", "r") as f:
    NODE_CONFIGS = json.load(f)

RATES_WINDOW = 5
requests.packages.urllib3.disable_warnings()
data_cache = {}
data_lock = threading.Lock()
data_cache_version = 0
prev_data = {}


def fetch_json_data(api_endpoint, token, path):
    HEADERS = {"Authorization": token}
    TIMEOUT = 15  # in seconds

    url = f"{api_endpoint}{path}"
    response = requests.get(url, headers=HEADERS, verify=False, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json().get("data", {})


def get_container_data(api_endpoint, token, node_name, container):
    container_id = container.get("vmid")
    container_info = fetch_json_data(
        api_endpoint, token, f"/nodes/{node_name}/lxc/{container_id}/config"
    )
    container_status = fetch_json_data(
        api_endpoint, token, f"/nodes/{node_name}/lxc/{container_id}/status/current"
    )

    current_netin = container_status.get("netin", 0)
    current_netout = container_status.get("netout", 0)

    key = f"{node_name}-{container_id}"

    if key not in prev_data:
        prev_data[key] = {
            "netin": CircularBuffer(RATES_WINDOW),
            "netout": CircularBuffer(RATES_WINDOW),
            "timestamp": CircularBuffer(RATES_WINDOW),
        }

    netin_rate, netout_rate = 0, 0
    prev_netin = prev_data[key]["netin"].get_oldest()
    prev_netout = prev_data[key]["netout"].get_oldest()
    prev_timestamp = prev_data[key]["timestamp"].get_oldest()

    if (
        prev_netin is not None
        and prev_netout is not None
        and prev_timestamp is not None
    ):
        time_elapsed = time.time() - prev_timestamp
        netin_rate = calculate_rate(current_netin, prev_netin, time_elapsed)
        #        print(f"{key} netin rate: {netin_rate}")
        netout_rate = calculate_rate(current_netout, prev_netout, time_elapsed)

    prev_data[key]["netin"].append(current_netin)
    prev_data[key]["netout"].append(current_netout)
    prev_data[key]["timestamp"].append(time.time())

    return {
        "id": container_id,
        "hostname": container_info.get("hostname"),
        "status": container.get("status"),
        "cpu": container_status.get("cpu", 0),
        "memory_used": int(container_status.get("mem", 0) / (1024 * 1024)),
        "memory_total": int(container_status.get("maxmem", 0) / (1024 * 1024)),
        "netin": current_netin,
        "netout": current_netout,
        "netin_rate": netin_rate,
        "netout_rate": netout_rate,
    }


def calculate_rate(current, prev, time_elapsed):
    return (current - prev) * 8 / time_elapsed  # bps rate


def get_node_data(api_endpoint, token, node):
    node_name = node.get("node")
    node_status = fetch_json_data(api_endpoint, token, f"/nodes/{node_name}/status")
    containers = fetch_json_data(api_endpoint, token, f"/nodes/{node_name}/lxc")
    containers = sorted(containers, key=lambda x: x.get("vmid", 0))

    return {
        "name": node_name,
        "cpu": node_status.get("cpu", 0),
        "disk": int(node.get("disk") / (1024 * 1024 * 1024)),
        "containers": list(
            map(
                lambda container: get_container_data(
                    api_endpoint, token, node_name, container
                ),
                containers,
            )
        ),
    }


def process_container_results(results, all_nodes_data):
    all_nodes_data.extend(result for success, result in results if success)


def process_results(results, all_nodes_data, NODE_CONFIGS):
    global data_cache_version
    for (success, nodes), config in zip(results, NODE_CONFIGS):
        if not success:
            print(f"Error fetching nodes for config {config}: {nodes}")
            continue

        api_endpoint = config.get("endpoint")
        token = config.get("token")
        nodes = sorted(nodes, key=lambda x: x.get("node", "").lower())

        container_futures = [
            deferToThread(get_node_data, api_endpoint, token, node) for node in nodes
        ]

        container_dlist = defer.DeferredList(container_futures)
        container_dlist.addCallback(process_container_results, all_nodes_data)
        container_dlist.addCallback(lambda _: update_data_cache(all_nodes_data))

    # Locking the data update section
    global data_cache
    with data_lock:
        data_cache = {"data": sorted(all_nodes_data, key=lambda x: x["name"].lower())}
        data_cache_version += 1


def update_data_cache(all_nodes_data):
    global data_cache
    global data_cache_version
    
    all_nodes_data = sorted(all_nodes_data, key=lambda x: x['name'])

    with data_lock:
        data_cache = {"data": all_nodes_data}
        data_cache_version += 1


def update_cache():
    try:
        deferreds = [
            deferToThread(
                fetch_json_data, config.get("endpoint"), config.get("token"), "/nodes"
            )
            for config in NODE_CONFIGS
        ]

        dlist = defer.DeferredList(deferreds)
        dlist.addCallback(process_results, all_nodes_data, NODE_CONFIGS)
        dlist.addCallback(lambda _: reactor.callLater(15, update_cache))


    except Exception as e:
        print(f"Error updating cache: {e}")
        reactor.callLater(15, update_cache)


class MyServerProtocol(WebSocketServerProtocol):
    def __init__(self):
        super().__init__()
        self.is_connected = False
        self.last_sent_version = 0

    def onConnect(self, request):
        print(f"Client connecting: {request.peer}")

    def onOpen(self):
        print("WebSocket connection open.")
        self.is_connected = True

        reactor.callLater(0, self.send_updates)

    def send_updates(self):
        if not self.is_connected:
            return

        try:
            if self.state == WebSocketServerProtocol.STATE_OPEN:
                with data_lock:
                    # Check if data version has been updated since the last send
                    if data_cache_version != self.last_sent_version:
                        self.sendMessage(json.dumps(data_cache).encode("utf-8"))
                        self.last_sent_version = data_cache_version
                        reactor.callLater(1, self.send_updates)
            else:
                print("WebSocket is not in an open state. Skipping sending updates.")

        except Exception as e:
            print(f"Error in send_updates: {e}")

    def onClose(self, wasClean, code, reason):
        print(f"WebSocket connection closed. Reason: {reason}")
        self.is_connected = False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WebSocket server for node data.")
    parser.add_argument(
        "--port", type=int, required=True, help="Port to run the WebSocket server on."
    )
    args = parser.parse_args()

    try:
        # update_cache()
        reactor.callLater(0, update_cache)

        factory = WebSocketServerFactory(f"ws://127.0.0.1:{args.port}")
        factory.protocol = MyServerProtocol

        reactor.listenTCP(args.port, factory)
        print(f"Server running at {factory.url}")
        reactor.run()

    except Exception as e:
        print(f"Server error: {e}")
