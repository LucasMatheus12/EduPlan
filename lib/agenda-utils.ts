import type { ApiAgendaItem } from "@/lib/api"

/** Minutos desde meia-noite a partir de "HH:MM" ou "HH:MM:SS". */
export function parseTimeToMinutes(t: string): number {
  const s = t.trim().slice(0, 8)
  const [h, m] = s.split(":").map((x) => Number.parseInt(x || "0", 10))
  return h * 60 + (m || 0)
}

export function intervalsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const as = parseTimeToMinutes(aStart)
  const ae = parseTimeToMinutes(aEnd)
  const bs = parseTimeToMinutes(bStart)
  const be = parseTimeToMinutes(bEnd)
  return as < be && bs < ae
}

export function formatTimeShort(iso: string): string {
  const m = iso.match(/(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : iso.slice(0, 5)
}

/** Garante "HH:MM:SS" para a API Django. */
export function normalizeTimeForApi(t: string): string {
  const trimmed = t.trim()
  if (!trimmed) return "08:00:00"
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) return trimmed.slice(0, 8)
  return "08:00:00"
}

export type AgendaSlotRow =
  | { type: "recess" }
  | { type: "slot"; start: string; end: string; label: string }

/** Faixas de 2h + intervalo de almoço (referência visual tipo grade acadêmica). */
export const AGENDA_GRID_ROWS: AgendaSlotRow[] = [
  { type: "slot", start: "08:00", end: "10:00", label: "08:00" },
  { type: "slot", start: "10:00", end: "12:00", label: "10:00" },
  { type: "recess" },
  { type: "slot", start: "12:00", end: "14:00", label: "12:00" },
  { type: "slot", start: "14:00", end: "16:00", label: "14:00" },
  { type: "slot", start: "16:00", end: "18:00", label: "16:00" },
  { type: "slot", start: "18:00", end: "22:00", label: "18:00" },
]

export const WEEK_COLUMNS = [
  { dia: 1, label: "Segunda" },
  { dia: 2, label: "Terça" },
  { dia: 3, label: "Quarta" },
  { dia: 4, label: "Quinta" },
  { dia: 5, label: "Sexta" },
  { dia: 6, label: "Sábado" },
] as const

export function filterItemsForCell(
  items: ApiAgendaItem[],
  dia: number,
  slotStart: string,
  slotEnd: string,
): ApiAgendaItem[] {
  return items.filter(
    (it) =>
      it.dia_semana === dia &&
      intervalsOverlap(it.hora_inicio, it.hora_fim, slotStart, slotEnd),
  )
}
