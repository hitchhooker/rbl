import { JSX } from 'solid-js';
import ContainerInfo from './ContainerInfo';
import UsageBar from './UsageBar';

interface NodeProps {
node: {
name: string;
cpu: number;
cpu_model: string;
cpu_cores: number;
cpu_mhz: number;
memory_used: number;
memory_total: number;
swap_used: number;
swap_total: number;
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
			<h3 class="text-lg text-center mt-3">System</h3>
			<h4>CPU</h4>
			<p>{props.node.cpu_model}</p>
			<UsageBar current={props.node.cpu} max={1} />
			<p>{props.node.cpu_cores} cores @ {props.node.cpu_mhz}MHz</p>
			<h4>Memory</h4>
			<UsageBar current={props.node.memory_used} max={props.node.memory_total} />
			({formatBytes(props.node.memory_used)} / {formatBytes(props.node.memory_total)})
			<h4>Swap</h4>
			<UsageBar current={props.node.swap_used} max={props.node.swap_total} />
			({formatBytes(props.node.swap_total)} / {formatBytes(props.node.swap_total)})
			<h4>{props.node.storage_type}_storage</h4>
			<UsageBar current={props.node.storage_used} max={props.node.storage_total} />
			({formatBytes(props.node.storage_used)} / {formatBytes(props.node.storage_total)})
			<h3 class="text-lg text-center mt-3">Containers</h3>
			<div mt-2>
			{props.node.containers.map(container => <ContainerInfo container={container} />)}
			</div>
			</div>
			);
}

function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
