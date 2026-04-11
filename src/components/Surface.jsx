export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const shellClass =
  'relative min-h-screen overflow-hidden bg-[#07111f] text-[#eef5ff] font-[Aptos,Segoe_UI,Trebuchet_MS,sans-serif]'

export const frameClass = 'relative z-10 mx-auto w-full'

export const displayFontClass = 'font-[Georgia,Times_New_Roman,serif]'

export const glassPanelClass =
  'relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/60 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl'

export const panelHighlightClass =
  'pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#4de2c5]/10 opacity-70'

export const pillClass =
  'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#eef5ff]'

export const sectionLabelClass =
  'mb-3 text-[0.84rem] font-bold uppercase tracking-[0.12em] text-slate-400'

export const bodyTextClass = 'text-base leading-7 text-slate-300/80'

export const inputClass =
  'w-full rounded-[18px] border border-white/10 bg-slate-950/80 px-4 py-4 text-[#eef5ff] outline-none transition duration-200 placeholder:text-slate-400/60 focus:-translate-y-0.5 focus:border-[#4de2c5]/60 focus:ring-4 focus:ring-[#4de2c5]/10'

export const primaryButtonClass =
  'rounded-[18px] border border-transparent bg-gradient-to-r from-[#4de2c5] to-[#7fffe3] px-5 py-4 font-bold text-[#052029] shadow-[0_18px_38px_rgba(77,226,197,0.24)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70'

export const secondaryButtonClass =
  'rounded-[18px] border border-white/10 bg-white/5 px-5 py-4 font-bold text-[#eef5ff] transition duration-200 hover:-translate-y-0.5 hover:bg-white/10'

export const insetCardClass = 'relative rounded-[24px] border border-white/10 bg-white/5'

export function BackgroundOrbs() {
  return (
    <>
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-gradient-to-br from-[#4de2c5]/30 to-transparent blur-3xl motion-safe:animate-pulse" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-96 w-96 rounded-full bg-gradient-to-br from-[#ff8a5b]/25 to-transparent blur-3xl motion-safe:animate-pulse" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/5 to-transparent" />
    </>
  )
}

export function GlassPanel({ as: Tag = 'section', className = '', children }) {
  return (
    <Tag className={cn(glassPanelClass, className)}>
      <div aria-hidden="true" className={panelHighlightClass} />
      <div className="relative z-10">{children}</div>
    </Tag>
  )
}
