function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Input({
  label,
  hint,
  error,
  iconLeft: IconLeft,
  iconRight,
  className = '',
  containerClassName = '',
  required = false,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {IconLeft && (
          <IconLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        )}
        <input
          className={cn(
            'w-full h-11 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
              : 'border-slate-200 dark:border-slate-700 focus:border-prpl focus:ring-2 focus:ring-prpl/15',
            IconLeft ? 'pl-10' : 'pl-4',
            iconRight ? 'pr-10' : 'pr-4',
            className,
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{iconRight}</div>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className = '',
  containerClassName = '',
  required = false,
  rows = 3,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-sm outline-none transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
            : 'border-slate-200 dark:border-slate-700 focus:border-prpl focus:ring-2 focus:ring-prpl/15',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  hint,
  error,
  className = '',
  containerClassName = '',
  required = false,
  children,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full h-11 px-4 rounded-xl border text-sm outline-none transition cursor-pointer',
          'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
            : 'border-slate-200 dark:border-slate-700 focus:border-prpl focus:ring-2 focus:ring-prpl/15',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
