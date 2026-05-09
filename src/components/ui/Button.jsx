function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const variants = {
  primary:
    'bg-prpl text-white shadow-[0_4px_14px_rgba(85,35,233,0.25)] hover:bg-prpl/90 hover:shadow-[0_6px_20px_rgba(85,35,233,0.35)] hover:-translate-y-px disabled:opacity-60 disabled:translate-y-0',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  outline:
    'bg-transparent text-prpl border border-prpl/20 hover:bg-prpl/8 hover:border-prpl/30',
  danger:
    'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20',
  soft:
    'bg-prpl/8 text-prpl hover:bg-prpl/15 dark:bg-prpl/15 dark:text-prpl/90 dark:hover:bg-prpl/25',
};

const sizes = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  xl: 'h-12 px-6 text-[0.95rem]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:ring-2 focus-visible:ring-prpl/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {IconLeft && <IconLeft className="w-4 h-4 shrink-0" />}
      {children}
      {IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
}
