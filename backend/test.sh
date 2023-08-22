#!/bin/bash

# File path
FILE_PATH=".nodes.json"

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
	echo '{"error": "File does not exist."}'
	exit 1
fi

# Function to fetch and aggregate data
fetch_data() {
	IFS=","
	set -- $1
	unset IFS
	local endpoint="$1"
	local token="$2"

	# Get node status
	node_data=$(curl -sk -H "Authorization: $token" "$endpoint/nodes" | jq -r '.data[0]')
	nodename=$(echo "$node_data" | jq -r '.node')
	node_status=$(echo "$node_data" | jq -r '.status')

	# Initialize a JSON array for containers
	containers_json="["

	# Get containers for the node
	containers=$(curl -sk -H "Authorization: $token" "$endpoint/nodes/$nodename/lxc" | jq -r '.data[].vmid')

	# Fetch each container's status
	for vmid in $containers; do
		container_data=$(curl -sk -H "Authorization: $token" "$endpoint/nodes/$nodename/lxc/$vmid/status/current")
		container_config=$(curl -sk -H "Authorization: $token" "$endpoint/nodes/$nodename/lxc/$vmid/config")

		container_status=$(echo "$container_data" | jq -r '.data.status')
		container_name=$(echo "$container_config" | jq -r '.data.hostname')

		containers_json+="{\"vmid\": \"$vmid\", \"name\": \"$container_name\", \"status\": \"$container_status\"},"
	done

	# Remove the trailing comma
	containers_json=${containers_json%,}

	# Construct the final JSON for the node
	echo "{\"node\": \"$nodename\", \"status\": \"$node_status\", \"containers\": $containers_json}"
}

export -f fetch_data

# Parse endpoints and tokens
endpoints=($(jq -r '.[].endpoint' $FILE_PATH))
tokens=($(jq -r '.[].token' $FILE_PATH))

# Combine endpoints and tokens into pairs
combined=()
for index in "${!endpoints[@]}"; do
	combined+=("${endpoints[index]},${tokens[index]}")
done

# Initialize JSON array for all node data
nodes_json="["

# Fetch and aggregate data in parallel
first=true
for data in $(parallel --will-cite fetch_data ::: "${combined[@]}"); do
	if [ "$first" = true ]; then
		first=false
	else
		nodes_json+=","
	fi
	nodes_json+="$data"
done

nodes_json+="]"

echo $nodes_json
