"use client"

import { Fragment } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ApiDisciplina } from "@/lib/api"
import type { User } from "@/contexts/AuthContext"
import { DisciplinaRequisitosPanel } from "@/components/curriculum/DisciplinaRequisitosPanel"
import { getCurriculumSubjectStatus, sumPeriodoCargaCreditos } from "@/lib/curriculum-status"
import { ArrowDown, ChevronRight, GitBranch, Layers, Sparkles } from "lucide-react"

interface CurriculumPipelineProps {
  sortedPeriods: string[]
  disciplinesByPeriod: Record<string, ApiDisciplina[]>
  safeDisciplinas: ApiDisciplina[]
  user: User
  onStatusChange: (
    subjectId: number,
    newStatus: "concluida" | "em_andamento" | "pendente" | "remove",
  ) => void
}

function periodNumber(label: string): number {
  return Number.parseInt(label.match(/(\d+)º/)?.[1] || "0", 10)
}

function periodProgress(subjects: ApiDisciplina[], user: User): number {
  if (subjects.length === 0) return 0
  const done = subjects.filter((s) => user.subjectStatuses[s.id] === "concluida").length
  return Math.round((done / subjects.length) * 100)
}

export function CurriculumPipeline({
  sortedPeriods,
  disciplinesByPeriod,
  safeDisciplinas,
  user,
  onStatusChange,
}: CurriculumPipelineProps) {
  if (sortedPeriods.length === 0) return null

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/40 to-blue-50/25 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] ring-1 ring-white/80",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] before:bg-[length:20px_20px] before:opacity-[0.35]",
        "xl:p-8",
      )}
    >
      <div className="relative">
        {/* Trilha superior (desktop) */}
        <div className="pointer-events-none absolute left-8 right-8 top-[4.25rem] z-0 hidden h-0.5 xl:block" aria-hidden>
          <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-200/20 via-indigo-400/50 to-violet-300/20 blur-[1px]" />
          <div className="absolute inset-y-0 left-0 right-0 mx-12 rounded-full bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
        </div>

        <div className="relative z-10 mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-md shadow-slate-200/40 backdrop-blur-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                <GitBranch className="h-4 w-4" aria-hidden />
              </span>
              Trilha por período
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              CH/CR do PPC · pré-requisitos e co-requisitos conforme matriz
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="h-4 w-4 text-indigo-500" aria-hidden />
            <span>
              {sortedPeriods.length} etapa{sortedPeriods.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-stretch xl:gap-0 xl:overflow-x-auto xl:pb-2 xl:pt-4">
          {sortedPeriods.map((period, colIndex) => {
            const subjects = disciplinesByPeriod[period] || []
            const step = periodNumber(period)
            const progress = periodProgress(subjects, user)
            const { ch: sumCh, cr: sumCr } = sumPeriodoCargaCreditos(subjects)
            const cargaParts = [sumCh > 0 ? `${sumCh}h` : "", sumCr > 0 ? `${sumCr} cr` : ""].filter(Boolean)
            const cargaLine = cargaParts.join(" · ")

            return (
              <Fragment key={period}>
                {colIndex > 0 && (
                  <>
                    <div className="flex flex-col items-center py-1 xl:hidden" aria-hidden>
                      <div className="h-6 w-px bg-gradient-to-b from-indigo-300 via-blue-400 to-violet-300" />
                      <div className="my-1 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-gradient-to-br from-white to-slate-50 shadow-lg shadow-indigo-200/50 ring-2 ring-indigo-100">
                        <ArrowDown className="h-5 w-5 text-indigo-500" strokeWidth={2.5} />
                      </div>
                      <div className="h-6 w-px bg-gradient-to-b from-violet-300 via-indigo-400 to-blue-200" />
                    </div>
                    <div
                      className="relative hidden w-16 shrink-0 flex-col items-center justify-center self-stretch xl:flex"
                      aria-hidden
                    >
                      <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-indigo-300/60 to-transparent" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-br from-white via-slate-50 to-indigo-50/80 shadow-xl shadow-indigo-300/30 ring-2 ring-indigo-100/80">
                        <ChevronRight className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
                      </div>
                    </div>
                  </>
                )}

                <section
                  className={cn(
                    "relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/70 bg-white/75 p-5 shadow-[0_12px_40px_-20px_rgba(30,41,59,0.35)] backdrop-blur-md",
                    "ring-1 ring-white/60",
                    "xl:min-w-[292px] xl:max-w-[340px]",
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-500/[0.06] to-transparent"
                    aria-hidden
                  />

                  <header className="relative mb-5">
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-xl font-black text-white shadow-lg shadow-slate-900/25 ring-2 ring-white/20">
                        {step || colIndex + 1}
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.35rem] items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-1 text-[8px] font-bold tabular-nums text-white shadow-md">
                          {progress}%
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h2 className="font-headline truncate text-lg font-bold tracking-tight text-slate-900">
                          {period}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {subjects.length} disciplina{subjects.length === 1 ? "" : "s"} nesta etapa
                          {cargaLine ? (
                            <span className="text-slate-400"> · {cargaLine}</span>
                          ) : null}
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </header>

                  <ul className="relative flex flex-col gap-3.5">
                    {subjects.map((subject, idx) => {
                      const meta = getCurriculumSubjectStatus(subject, user)
                      const Icon = meta.icon
                      const isBlocked = meta.status === "locked"
                      const currentStatus = user.subjectStatuses[subject.id]

                      return (
                        <li key={subject.id} className="relative">
                          {idx > 0 && (
                            <div
                              className="absolute -top-2 left-6 h-2 w-px bg-gradient-to-b from-slate-200 to-transparent xl:left-7"
                              aria-hidden
                            />
                          )}
                          <article
                            className={cn(
                              "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 pl-5 shadow-md transition-all duration-300",
                              "hover:border-slate-300/90 hover:shadow-lg hover:shadow-slate-200/50",
                              !isBlocked && "hover:-translate-y-0.5",
                              isBlocked && "opacity-[0.92]",
                            )}
                          >
                            <div
                              className={cn(
                                "absolute left-0 top-0 h-full w-1.5 rounded-l-2xl",
                                meta.status === "concluida" && "bg-emerald-500",
                                meta.status === "em_andamento" && "bg-sky-500",
                                meta.status === "pendente" && "bg-amber-500",
                                meta.status === "available" && "bg-slate-300",
                                meta.status === "locked" && "bg-rose-500",
                              )}
                              aria-hidden
                            />

                            <div className="relative">
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <h3
                                  className={cn(
                                    "text-[13px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-sm",
                                    isBlocked && "text-rose-900/90",
                                  )}
                                >
                                  {subject.nome}
                                </h3>
                                <span
                                  className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/90 shadow-inner",
                                    meta.status === "concluida" && "border-emerald-200/80 bg-emerald-50 text-emerald-600",
                                    meta.status === "em_andamento" && "border-sky-200/80 bg-sky-50 text-sky-600",
                                    meta.status === "pendente" && "border-amber-200/80 bg-amber-50 text-amber-600",
                                    meta.status === "available" && "text-slate-400",
                                    meta.status === "locked" && "border-rose-200/80 bg-rose-50 text-rose-500",
                                  )}
                                >
                                  <Icon className="h-4 w-4" aria-hidden />
                                </span>
                              </div>

                              <Badge
                                variant="secondary"
                                className={cn(
                                  "mb-3 border-0 text-[10px] font-bold uppercase tracking-wide",
                                  meta.color,
                                )}
                              >
                                {meta.label}
                              </Badge>

                              {!isBlocked && (
                                <div className="mb-3 flex flex-wrap gap-1.5">
                                  <Button
                                    size="sm"
                                    variant={currentStatus === "concluida" ? "default" : "outline"}
                                    className={cn(
                                      "h-8 rounded-full px-3 text-[11px] font-semibold",
                                      currentStatus === "concluida"
                                        ? "border-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700"
                                        : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/80",
                                    )}
                                    onClick={() =>
                                      onStatusChange(subject.id, currentStatus === "concluida" ? "remove" : "concluida")
                                    }
                                  >
                                    {currentStatus === "concluida" ? "✓ Concluída" : "Concluir"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={currentStatus === "em_andamento" ? "default" : "outline"}
                                    className={cn(
                                      "h-8 rounded-full px-3 text-[11px] font-semibold",
                                      currentStatus === "em_andamento"
                                        ? "border-0 bg-gradient-to-r from-sky-600 to-blue-600 shadow-md shadow-sky-600/25 hover:from-sky-700 hover:to-blue-700"
                                        : "border-slate-200 hover:border-sky-300 hover:bg-sky-50/80",
                                    )}
                                    onClick={() =>
                                      onStatusChange(
                                        subject.id,
                                        currentStatus === "em_andamento" ? "remove" : "em_andamento",
                                      )
                                    }
                                  >
                                    {currentStatus === "em_andamento" ? "▶ Andamento" : "Iniciar"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={currentStatus === "pendente" ? "default" : "outline"}
                                    className={cn(
                                      "h-8 rounded-full px-3 text-[11px] font-semibold",
                                      currentStatus === "pendente"
                                        ? "border-0 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600"
                                        : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/80",
                                    )}
                                    onClick={() =>
                                      onStatusChange(subject.id, currentStatus === "pendente" ? "remove" : "pendente")
                                    }
                                  >
                                    {currentStatus === "pendente" ? "Planejada" : "Planejar"}
                                  </Button>
                                </div>
                              )}

                              <DisciplinaRequisitosPanel
                                subject={subject}
                                safeDisciplinas={safeDisciplinas}
                                user={user}
                                isBlocked={isBlocked}
                                compact
                              />
                            </div>
                          </article>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
