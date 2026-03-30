"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ApiDisciplina } from "@/lib/api"
import type { User } from "@/contexts/AuthContext"
import {
  formatCargaCreditos,
  normalizeCoRequisitos,
  normalizePreRequisitos,
} from "@/lib/curriculum-status"
import { Link2 } from "lucide-react"

interface DisciplinaRequisitosPanelProps {
  subject: ApiDisciplina
  safeDisciplinas: ApiDisciplina[]
  user: User
  isBlocked: boolean
  /** Estilo mais compacto (pipeline horizontal) */
  compact?: boolean
}

export function DisciplinaRequisitosPanel({
  subject,
  safeDisciplinas,
  user,
  isBlocked,
  compact = false,
}: DisciplinaRequisitosPanelProps) {
  const completedSubjects = Array.isArray(user.completedSubjects) ? user.completedSubjects : []
  const preRequisitos = normalizePreRequisitos(subject)
  const coRequisitos = normalizeCoRequisitos(subject)
  const carga = formatCargaCreditos(subject)

  const badgePad = compact ? "px-2 py-0.5" : "px-2.5 py-0.5"
  const labelXs = "text-[10px]"

  return (
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      {carga && (
        <p className={cn("font-medium tabular-nums text-slate-500", compact ? "text-[10px]" : "text-[11px]")}>
          {carga}
        </p>
      )}

      {preRequisitos.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
          <p className={cn("mb-2 font-bold uppercase tracking-[0.12em] text-slate-400", labelXs)}>
            Pré-requisitos{isBlocked ? " · pendentes" : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preRequisitos.map((prereqId: number) => {
              const prereqSubject = safeDisciplinas.find((s) => s.id === prereqId)
              const isPrereqCompleted = completedSubjects.includes(prereqId)
              return (
                <Badge
                  key={prereqId}
                  variant="outline"
                  className={cn(
                    "rounded-full border font-semibold",
                    badgePad,
                    labelXs,
                    isPrereqCompleted
                      ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
                      : "border-rose-200/80 bg-rose-50 text-rose-800",
                  )}
                >
                  {isPrereqCompleted ? "✓" : "○"} {prereqSubject?.nome || `ID ${prereqId}`}
                </Badge>
              )
            })}
          </div>
          {isBlocked && (
            <p className="mt-2 text-[10px] font-medium text-rose-600">
              Conclua os pré-requisitos em destaque para liberar.
            </p>
          )}
        </div>
      )}

      {coRequisitos.length > 0 && (
        <div className="rounded-xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/80 to-violet-50/40 p-2.5">
          <p className="mb-2 flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-indigo-600/90">
            <Link2 className="h-3 w-3 shrink-0" aria-hidden />
            <span className={labelXs}>Co-requisitos (mesmo período)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {coRequisitos.map((coId) => {
              const coSubject = safeDisciplinas.find((s) => s.id === coId)
              const st = user.subjectStatuses[coId]
              const done = st === "concluida"
              const active = st === "em_andamento" || st === "pendente"
              return (
                <Badge
                  key={coId}
                  variant="outline"
                  className={cn(
                    "rounded-full border font-semibold",
                    badgePad,
                    labelXs,
                    done && "border-emerald-300/80 bg-white/90 text-emerald-900",
                    !done &&
                      active &&
                      "border-sky-300/80 bg-white/90 text-sky-900",
                    !done && !active && "border-indigo-200/90 bg-white/70 text-indigo-900",
                  )}
                >
                  {done ? "✓" : active ? "◐" : "◇"} {coSubject?.nome ?? `#${coId}`}
                </Badge>
              )
            })}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-indigo-700/85">
            Previstos no PPC para serem cursados em conjunto; não substituem os pré-requisitos acima.
          </p>
        </div>
      )}
    </div>
  )
}
