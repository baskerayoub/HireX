export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-2xl surface-primary p-12 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-prpl/10 to-accent/10 dark:from-prpl/15 dark:to-accent/15 text-prpl flex items-center justify-center mx-auto mb-5">
          <Icon className="w-7 h-7" />
        </div>
      )}
      {title && (
        <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</p>
      )}
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
