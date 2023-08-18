import { JSX } from 'solid-js';
import UsageBar from './UsageBar';
import StatusBar from './StatusBar';

interface ContainerProps {
  container: {
    id: number;
    hostname: string;
    status: string;
    cpu: number;
    memory_used: number;
    memory_total: number;
    netin: number;
    netout: number;
  };
}

export default function ContainerInfo(props: ContainerProps): JSX.Element {
  const statusClass = props.container.status === 'running' ? 'bg-green' : 'bg-red';

  return (
    <div className="p-3 border my-4 bg-blue-200 rounded shadow-sm">
      <h3 className="text-xl">{props.container.hostname}</h3>
      <p>Status: <StatusBar status={props.container.status} /></p>
      <p>CPU Usage: <UsageBar current={props.container.cpu} max={1} /></p>
      <p>Memory Used: <UsageBar current={props.container.memory_used} max={props.container.memory_total} /></p>
      <p>Network In: {humanReadableSize(props.container.netin)}</p>
      <p>Network Out: {humanReadableSize(props.container.netout)}</p>
    </div>
  );
}


function humanReadableSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}
