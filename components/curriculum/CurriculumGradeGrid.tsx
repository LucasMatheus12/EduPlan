"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ApiDisciplina } from "@/lib/api"
import type { User } from "@/contexts/AuthContext"
import { DisciplinaRequisitosPanel } from "@/components/curriculum/DisciplinaRequisitosPanel"
import { getCurriculumSubjectStatus, sumPeriodoCargaCreditos } from "@/lib/curriculum-status"
import { BookOpen, GraduationCap } from "lucide-react"

interface CurriculumGradeGridProps {
  sortedPeriods: string[]
  disciplinesByPeriod: Record<string, ApiDisciplina[]>
  safeDisciplinas: ApiDisciplina[]
  user: User
  onStatusChange: (
    subjectId: number,
    newStatus: "concluida" | "em_andamento" | "pendente" | "remove",
  ) => void
}

function periodNum(label: string) {
  return Number.parseInt(label.match(/(\d+)º/)?.[1] || "0", 10)
}

export function CurriculumGradeGrid({
  sortedPeriods,
  disciplinesByPeriod,
  safeDisciplinas,
  user,
  onStatusChange,
}: CurriculumGradeGridProps) {
  return (
    <div
      className={cn(
        "space-y-8 rounded-[1.75rem] border border-slate-200/60 bg-gradient-to-b from-white via-slate-50/30 to-indigo-50/20 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.15)] ring-1 ring-white/70",
        "sm:p-8",
      )}
    >
      {sortedPeriods.map((period) => {
        const n = periodNum(period)
        const subjects = disciplinesByPeriod[period] || []
        const done = subjects.filter((s) => user.subjectStatuses[s.id] === "concluida").length
        const pct = subjects.length ? Math.round((done / subjects.length) * 100) : 0
        const { ch: sumCh, cr: sumCr } = sumPeriodoCargaCreditos(subjects)
        const cargaPeriodoParts = [sumCh > 0 ? `${sumCh}h` : "", sumCr > 0 ? `${sumCr} cr` : ""].filter(Boolean)
        const cargaPeriodo = cargaPeriodoParts.length ? ` · ${cargaPeriodoParts.join(" · ")}` : ""

        return (
          <section
            key={period}
            className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 shadow-lg shadow-slate-200/40 backdrop-blur-sm"
          >
            <div className="relative flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(99,102,241,0.12)_50%,transparent_60%)]" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black shadow-inner ring-1 ring-white/20 backdrop-blur-sm">
                  {n || "—"}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-indigo-200/90">
                    <BookOpen className="h-4 w-4" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-widest">Período</span>
                  </div>
                  <h2 className="font-headline mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">{period}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-slate-300">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-indigo-300" aria-hidden />
                    <span>
                      {subjects.length} disciplina{subjects.length === 1 ? "" : "s"}
                      {cargaPeriodo}
                    </span>
                  </p>
                </div>
              </div>
              <div className="relative flex items-center gap-3 sm:flex-col sm:items-end">
                <span className="text-xs font-medium text-indigo-200">Progresso no período</span>
                <div className="flex w-full min-w-[140px] items-center gap-2 sm:w-48">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold tabular-nums text-white">{pct}%</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {subjects.map((subject) => {
                const { status, icon: Icon, color, label } = getCurriculumSubjectStatus(subject, user)
                const currentStatus = user.subjectStatuses[subject.id]
                const isBlocked = status === "locked"

                return (
                  <div
                    key={subject.id}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-md transition-all duration-300",
                      "hover:-translate-y-0.5 hover:shadow-xl",
                      isBlocked
                        ? "border-rose-200/90 bg-gradient-to-br from-rose-50/90 to-white opacity-95 ring-1 ring-rose-100/80"
                        : "border-slate-200/80 hover:border-indigo-200/60 hover:shadow-indigo-100/40",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full w-1.5 rounded-l-2xl",
                        status === "concluida" && "bg-emerald-500",
                        status === "em_andamento" && "bg-sky-500",
                        status === "pendente" && "bg-amber-500",
                        status === "available" && "bg-slate-300",
                        status === "locked" && "bg-rose-500",
                      )}
                      aria-hidden
                    />

                    <div className="relative pl-3">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-semibold leading-snug text-slate-900",
                            isBlocked && "text-rose-900/90",
                          )}
                        >
                          {subject.nome}
                        </h3>
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-slate-50/90 shadow-inner",
                            status === "concluida" && "border-emerald-200/80 bg-emerald-50 text-emerald-600",
                            status === "em_andamento" && "border-sky-200/80 bg-sky-50 text-sky-600",
                            status === "pendente" && "border-amber-200/80 bg-amber-50 text-amber-600",
                            status === "available" && "border-slate-100 text-slate-400",
                            status === "locked" && "border-rose-200/80 bg-rose-50 text-rose-500",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>

                      <Badge variant="secondary" className={cn("mb-3 border-0 text-[10px] font-bold uppercase tracking-wide", color)}>
                        {label}
                      </Badge>

                      {!isBlocked && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant={currentStatus === "concluida" ? "default" : "outline"}
                            className={cn(
                              "h-8 rounded-full px-3 text-[11px] font-semibold",
                              currentStatus === "concluida"
                                ? "border-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700"
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
                                ? "border-0 bg-gradient-to-r from-sky-600 to-blue-600 shadow-md shadow-sky-600/20 hover:from-sky-700 hover:to-blue-700"
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
                                ? "border-0 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600"
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
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
