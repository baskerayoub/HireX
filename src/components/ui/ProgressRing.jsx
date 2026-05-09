function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ProgressRing({
  value = 0,
  size = 96,
  strokeWidth = 8,
  className = '',
  label,
  showValue = true,
  color,
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const ringColor =
    color ||
    (safeValue >= 75
      ? '#10b981'
      : safeValue >= 50
        ? '#5523e9'
        : safeValue >= 25
          ? '#f59e0b'
          : '#ef4444');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-slate-900 dark:text-slate-100 leading-none ${size <= 44 ? 'text-[11px]' : size <= 64 ? 'text-base' : 'text-xl'}`}>
            {Math.round(safeValue)}
            {size > 44 && <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">%</span>}
          </span>
          {label && (
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1 font-bold">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
