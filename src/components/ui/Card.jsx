function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Card({ className = '', interactive = false, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'transition-all',
        interactive && 'hover:shadow-md hover:-translate-y-0.5 dark:hover:border-slate-700',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-100 dark:border-slate-800', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-100 dark:border-slate-800', className)}>
      {children}
    </div>
  );
}
