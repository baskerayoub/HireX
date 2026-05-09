const statusConfig = {
  received:  { label: 'Received',  bg: 'bg-blue-500/8 dark:bg-blue-500/12',       text: 'text-blue-600 dark:text-blue-400',       dot: 'bg-blue-500' },
  selected:  { label: 'Selected',  bg: 'bg-purple-500/8 dark:bg-purple-500/12',   text: 'text-purple-600 dark:text-purple-400',   dot: 'bg-purple-500' },
  validated: { label: 'Validated', bg: 'bg-emerald-500/8 dark:bg-emerald-500/12', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Declined:  { label: 'Declined',  bg: 'bg-red-500/8 dark:bg-red-500/12',         text: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500' },
  traited:   { label: 'Processed', bg: 'bg-amber-500/8 dark:bg-amber-500/12',     text: 'text-amber-600 dark:text-amber-400',     dot: 'bg-amber-500' },
  discarded: { label: 'Discarded', bg: 'bg-slate-500/8 dark:bg-slate-500/12',     text: 'text-slate-600 dark:text-slate-400',     dot: 'bg-slate-400' },
  Active:    { label: 'Active',    bg: 'bg-emerald-500/8 dark:bg-emerald-500/12', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Completed: { label: 'Completed', bg: 'bg-blue-500/8 dark:bg-blue-500/12',       text: 'text-blue-600 dark:text-blue-400',       dot: 'bg-blue-500' },
  Draft:     { label: 'Draft',     bg: 'bg-slate-500/8 dark:bg-slate-500/12',     text: 'text-slate-600 dark:text-slate-400',     dot: 'bg-slate-400' },
  Created:   { label: 'Scheduled', bg: 'bg-blue-500/8 dark:bg-blue-500/12',       text: 'text-blue-600 dark:text-blue-400',       dot: 'bg-blue-500' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-500/8 dark:bg-red-500/12',         text: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500' },
  Updated:   { label: 'Updated',   bg: 'bg-amber-500/8 dark:bg-amber-500/12',     text: 'text-amber-600 dark:text-amber-400',     dot: 'bg-amber-500' },
  Published: { label: 'Published', bg: 'bg-emerald-500/8 dark:bg-emerald-500/12', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-500/8 dark:bg-slate-500/12',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {config.label}
    </span>
  );
}
