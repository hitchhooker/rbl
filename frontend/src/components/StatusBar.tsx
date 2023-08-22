interface UsageBarProps {
  status: "running" | "stopped" | "paused" | "other";
}

function UsageBar({ status }: UsageBarProps) {

  let bgColor;
  switch (status) {
    case "running":
      bgColor = "bg-hex-AECE4B"; // Neon Green
      break;
    case "stopped":
      bgColor = "bg-red";
      break;
    case "paused":
      bgColor = "bg-yellow-500";
      break;
    default:
      bgColor = "bg-gray-400";
  }

  return (
    <div class="bg-gray-200 h-5 rounded overflow-hidden">
      <div class={`${bgColor} h-full w-full`}></div>
    </div>
  );
}

export default UsageBar;
