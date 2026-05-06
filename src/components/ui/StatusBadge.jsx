const statusConfig = {
  received: { label: 'Received', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  selected: { label: 'Selected', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  validated: { label: 'Validated', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Declined: { label: 'Declined', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  traited: { label: 'Processed', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  discarded: { label: 'Discarded', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  Active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Completed: { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  Created: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Updated: { label: 'Updated', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Published: { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
