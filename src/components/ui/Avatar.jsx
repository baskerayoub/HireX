function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const sizes = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

export default function Avatar({
  name = '',
  size = 'md',
  className = '',
  variant = 'soft',
  ...props
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || '?';

  const variantClass =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-prpl to-purple-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]'
      : 'bg-gradient-to-br from-prpl/15 to-accent/10 text-prpl dark:from-prpl/25 dark:to-accent/15';

  return (
    <div
      className={cn(
        'rounded-xl font-bold flex items-center justify-center select-none shrink-0',
        sizes[size],
        variantClass,
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
