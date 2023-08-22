import { JSX } from 'solid-js';
import ContainerInfo from './ContainerInfo';
import UsageBar from './UsageBar';

interface NodeProps {
  node: {
    name: string;
    cpu: number;
    memory_used: number;
    memory_total: number;
    disk: number;
    containers: Array<typeof ContainerInfo>;
    storage_type: string;
    storage_used: number;
    storage_total: number;
  };
}

export default function NodeInfo(props: NodeProps): JSX.Element {
  return (
    <div class="p-4 border m-2 bg-hex-A3916F bg-op-80 filter-drop-shadow text-hex-010001 rounded shadow-md">
      <h2 class="text-2xl text-center fw-bold font-lobster">{props.node.name}</h2>
      <p>CPU Usage: <UsageBar current={props.node.cpu} max={1} /></p>
      <p>{props.node.storage_type}_storage: <UsageBar current={props.node.storage_used} max={props.node.storage_total} /></p>
      <h3 class="text-lg text-center mt-3">Containers</h3>
      <div mt-2>
        {props.node.containers.map(container => <ContainerInfo container={container} />)}
      </div>
    </div>
  );
}

