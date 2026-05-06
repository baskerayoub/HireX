import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  icon: EmptyIcon = Inbox, 
  title = 'No data yet', 
  description = 'Get started by creating your first item.',
  action = null 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-prpl/8 text-prpl flex items-center justify-center mb-5">
        <EmptyIcon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}
