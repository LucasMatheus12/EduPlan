import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeroProps {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  children?: ReactNode
}

export function PageHero({ eyebrow, title, description, className, children }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative mb-10 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/40 p-6 shadow-xl shadow-slate-200/30 sm:p-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/15 to-indigo-500/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-sky-400/10 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600/90">{eyebrow}</p>
        )}
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}

interface MetaChipProps {
  icon: ReactNode
  label: string
  value: string
}

export function PageHeroMetaChip({ icon, label, value }: MetaChipProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:shadow-md">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 text-blue-700">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
