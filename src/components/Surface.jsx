export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const shellClass =
  'relative min-h-screen bg-[#f5f7fb] text-slate-900 font-[Aptos,Segoe_UI,Trebuchet_MS,sans-serif]'

export const frameClass = 'relative z-10 mx-auto w-full'

export const displayFontClass = 'font-semibold tracking-[-0.04em] text-slate-900'

export const glassPanelClass =
  'relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm'

export const panelHighlightClass =
  'pointer-events-none absolute inset-0 bg-transparent opacity-0'

export const pillClass =
  'inline-flex items-center gap-2 rounded-full border border-prpl/20 bg-prpl/5 px-4 py-2 text-[0.78rem] font-semibold tracking-wide text-prpl'

export const sectionLabelClass =
  'mb-3 text-[0.84rem] font-bold uppercase tracking-[0.12em] text-slate-500'

export const bodyTextClass = 'text-base leading-7 text-slate-600'

export const inputClass =
  'h-[62px] w-full rounded-lg bg-white px-5 pr-14 text-[1.02rem] text-slate-800 outline-none border border-slate-200 transition focus-within:border-prpl focus-within:shadow-[0_0_0_2px_rgba(85,35,233,0.10)] placeholder:text-slate-400'

export const primaryButtonClass =
  'rounded-xl border border-transparent bg-prpl px-5 py-4 font-bold text-white shadow-[0_14px_24px_rgba(85,35,233,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_28px_rgba(85,35,233,0.25)] disabled:cursor-wait disabled:opacity-70'

export const secondaryButtonClass =
  'rounded-xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-prpl/40 hover:shadow-[0_14px_24px_rgba(85,35,233,0.05)]'

export const insetCardClass = 'relative rounded-[16px] border border-slate-100 bg-slate-50/50'

export function BackgroundOrbs() {
  return null; // No orbs for light mode
}

export function GlassPanel({ as: Component = 'section', className = '', children }) {
  return (
    <Component className={cn(glassPanelClass, className)}>
      <div className="relative z-10">{children}</div>
    </Component>
  )
}
