export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} border-2 border-prpl/15 border-t-prpl rounded-full animate-spin`} />
        <div
          className={`absolute inset-0 ${sizes[size]} border-2 border-accent/10 border-b-accent rounded-full animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-4">{text}</p>
      )}
    </div>
  );
}
