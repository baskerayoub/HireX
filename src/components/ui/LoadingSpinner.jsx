export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizeClass} border-prpl/20 border-t-prpl rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}
