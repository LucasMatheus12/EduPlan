import { CheckCircle, Circle, Clock, Lock, Play, type LucideIcon } from "lucide-react"
import type { ApiDisciplina } from "@/lib/api"
import type { User } from "@/contexts/AuthContext"

export type CurriculumStatusKey = "locked" | "concluida" | "em_andamento" | "pendente" | "available"

export interface CurriculumStatusMeta {
  status: CurriculumStatusKey
  icon: LucideIcon
  color: string
  label: string
  stripeClass: string
}

export function normalizePreRequisitos(subject: ApiDisciplina): number[] {
  if (Array.isArray(subject.preRequisitos)) return subject.preRequisitos
  if (Array.isArray(subject.pre_requisitos)) return subject.pre_requisitos
  return []
}

export function normalizeCoRequisitos(subject: ApiDisciplina): number[] {
  if (Array.isArray(subject.coRequisitos)) return subject.coRequisitos
  if (Array.isArray(subject.co_requisitos)) return subject.co_requisitos
  return []
}

/** Ex.: "60h · 4 cr" — alinhado ao PPC (CH / CR). */
export function formatCargaCreditos(subject: ApiDisciplina): string | null {
  const ch = subject.carga_horaria
  const cr = subject.creditos
  if (ch == null && cr == null) return null
  const parts: string[] = []
  if (ch != null) parts.push(`${ch}h`)
  if (cr != null) parts.push(`${cr} cr`)
  return parts.join(" · ")
}

export function sumPeriodoCargaCreditos(subjects: ApiDisciplina[]): { ch: number; cr: number } {
  return subjects.reduce(
    (acc, s) => ({
      ch: acc.ch + (s.carga_horaria ?? 0),
      cr: acc.cr + (s.creditos ?? 0),
    }),
    { ch: 0, cr: 0 },
  )
}

export function isSubjectAvailable(subject: ApiDisciplina, user: User): boolean {
  const preRequisitos = normalizePreRequisitos(subject)
  if (preRequisitos.length === 0) return true
  const completedSubjects = Array.isArray(user.completedSubjects) ? user.completedSubjects : []
  return preRequisitos.every((prereq) => completedSubjects.includes(prereq))
}

export function getCurriculumSubjectStatus(subject: ApiDisciplina, user: User): CurriculumStatusMeta {
  const isAvailable = isSubjectAvailable(subject, user)

  if (!isAvailable) {
    return {
      status: "locked",
      icon: Lock,
      color: "bg-rose-100 text-rose-800",
      label: "Bloqueada",
      stripeClass: "border-l-rose-500",
    }
  }

  const currentStatus = user.subjectStatuses[subject.id]

  if (currentStatus === "concluida") {
    return {
      status: "concluida",
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-800",
      label: "Concluída",
      stripeClass: "border-l-emerald-500",
    }
  }

  if (currentStatus === "em_andamento") {
    return {
      status: "em_andamento",
      icon: Play,
      color: "bg-sky-100 text-sky-800",
      label: "Em andamento",
      stripeClass: "border-l-sky-500",
    }
  }

  if (currentStatus === "pendente") {
    return {
      status: "pendente",
      icon: Clock,
      color: "bg-amber-100 text-amber-900",
      label: "Planejada",
      stripeClass: "border-l-amber-500",
    }
  }

  return {
    status: "available",
    icon: Circle,
    color: "bg-slate-100 text-slate-600",
    label: "Disponível",
    stripeClass: "border-l-slate-300",
  }
}
