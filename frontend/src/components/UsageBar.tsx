interface UsageBarProps {
  current: number;
  max: number;
}

function UsageBar({ current, max }: UsageBarProps) {
  const percentage = (current / max) * 100;

  return (
    <div class="bg-gray-200 h-5 rounded overflow-hidden">
      <div style={{ width: `${percentage}%` }} class="bg-hex-AECE4B h-full"></div>
    </div>
  );
}

export default UsageBar;
