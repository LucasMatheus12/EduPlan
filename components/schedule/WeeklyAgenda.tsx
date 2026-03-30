"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  AGENDA_GRID_ROWS,
  filterItemsForCell,
  formatTimeShort,
  normalizeTimeForApi,
  parseTimeToMinutes,
  WEEK_COLUMNS,
  type AgendaSlotRow,
} from "@/lib/agenda-utils"
import { apiService, type AgendaItemPayload, type ApiAgendaItem, type AgendaLocationType, type AgendaTheme } from "@/lib/api"
import { Building2, GraduationCap, Loader2, MapPin, Plus, Trash2, Video } from "lucide-react"

function LocationGlyph({ tipo }: { tipo: AgendaLocationType }) {
  const cls = "h-3.5 w-3.5 shrink-0 opacity-80"
  switch (tipo) {
    case "online":
      return <Video className={cls} aria-hidden />
    case "lab":
      return <Building2 className={cls} aria-hidden />
    case "classroom":
      return <GraduationCap className={cls} aria-hidden />
    default:
      return <MapPin className={cls} aria-hidden />
  }
}

function AgendaCard({
  item,
  onClick,
}: {
  item: ApiAgendaItem
  onClick: () => void
}) {
  const isBlue = item.tema === "blue"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        "rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg border border-black/[0.04] px-3 py-2.5 shadow-sm",
        isBlue
          ? "border-l-[5px] border-l-blue-600 bg-[rgba(219,234,254,0.55)] text-blue-950"
          : "border-l-[5px] border-l-orange-700 bg-[rgba(255,237,213,0.55)] text-orange-950",
      )}
    >
      <p className="line-clamp-2 text-xs font-bold leading-snug tracking-tight">{item.titulo}</p>
      {item.local_nome ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium opacity-90">
          <LocationGlyph tipo={item.tipo_local} />
          <span className="truncate">{item.local_nome}</span>
        </p>
      ) : null}
      <p className="mt-2 text-[10px] font-semibold tabular-nums opacity-80">
        {formatTimeShort(item.hora_inicio)} – {formatTimeShort(item.hora_fim)}
      </p>
    </button>
  )
}

const emptyDraft = (): AgendaItemPayload => ({
  titulo: "",
  local_nome: "",
  tipo_local: "physical",
  dia_semana: 1,
  hora_inicio: "08:00:00",
  hora_fim: "10:00:00",
  tema: "blue",
})

interface WeeklyAgendaProps {
  userId: number
}

export function WeeklyAgenda({ userId }: WeeklyAgendaProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<ApiAgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<AgendaItemPayload>(emptyDraft)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiService.getAgendaItens()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar a agenda.", variant: "destructive" })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load, userId])

  const openNew = (dia: number, slot: Extract<AgendaSlotRow, { type: "slot" }>) => {
    setEditingId(null)
    setForm({
      ...emptyDraft(),
      dia_semana: dia,
      hora_inicio: normalizeTimeForApi(slot.start),
      hora_fim: normalizeTimeForApi(slot.end),
    })
    setOpen(true)
  }

  const openEdit = (item: ApiAgendaItem) => {
    setEditingId(item.id)
    setForm({
      titulo: item.titulo,
      local_nome: item.local_nome || "",
      tipo_local: item.tipo_local,
      dia_semana: item.dia_semana,
      hora_inicio: item.hora_inicio,
      hora_fim: item.hora_fim,
      tema: item.tema,
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" })
      return
    }
    const hi = normalizeTimeForApi(form.hora_inicio.length <= 5 ? `${form.hora_inicio}:00` : form.hora_inicio)
    const hf = normalizeTimeForApi(form.hora_fim.length <= 5 ? `${form.hora_fim}:00` : form.hora_fim)
    if (parseTimeToMinutes(hi) >= parseTimeToMinutes(hf)) {
      toast({ title: "Horário inválido", description: "O fim deve ser depois do início.", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const payload: AgendaItemPayload = {
        ...form,
        titulo: form.titulo.trim(),
        local_nome: form.local_nome?.trim() || "",
        hora_inicio: hi,
        hora_fim: hf,
      }
      if (editingId) {
        await apiService.updateAgendaItem(editingId, payload)
        toast({ title: "Aula atualizada" })
      } else {
        await apiService.createAgendaItem(payload)
        toast({ title: "Aula adicionada" })
      }
      setOpen(false)
      await load()
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      await apiService.deleteAgendaItem(editingId)
      toast({ title: "Removido da agenda" })
      setOpen(false)
      await load()
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-[#f8f9fb] shadow-[0_24px_60px_-28px_rgba(15,23,42,0.2)] ring-1 ring-white/90">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200/90 bg-white/95">
                <th className="sticky left-0 z-20 min-w-[88px] border-r border-slate-100 bg-[#f1f3f6] px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Horário
                </th>
                {WEEK_COLUMNS.map((d) => (
                  <th
                    key={d.dia}
                    className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-700"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENDA_GRID_ROWS.map((row, ri) => {
                if (row.type === "recess") {
                  return (
                    <tr key={`recess-${ri}`} className="border-y border-slate-200/80 bg-slate-100/90">
                      <td
                        colSpan={7}
                        className="py-3 text-center text-[11px] font-bold uppercase tracking-[0.35em] text-slate-400"
                      >
                        Intervalo · almoço / pausa
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={`${row.start}-${row.end}`} className="border-b border-slate-100/90 bg-white/40">
                    <td className="sticky left-0 z-10 border-r border-slate-100 bg-[#f1f3f6] px-3 py-3 align-top text-xs font-bold tabular-nums text-slate-600">
                      {row.label}
                    </td>
                    {WEEK_COLUMNS.map((col) => {
                      const cellItems = filterItemsForCell(items, col.dia, row.start, row.end)
                      return (
                        <td key={col.dia} className="align-top p-2">
                          <div className="flex min-h-[88px] flex-col gap-2">
                            {cellItems.map((it) => (
                              <AgendaCard key={it.id} item={it} onClick={() => openEdit(it)} />
                            ))}
                            <button
                              type="button"
                              onClick={() => openNew(col.dia, row)}
                              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200/90 bg-white/40 py-3 text-[11px] font-semibold text-slate-400 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Adicionar
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-200/80 sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {editingId ? "Editar aula" : "Nova aula na grade"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Disciplina / título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex.: Algoritmos e Estruturas de Dados"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="local">Local ou link</Label>
              <Input
                id="local"
                value={form.local_nome}
                onChange={(e) => setForm((f) => ({ ...f, local_nome: e.target.value }))}
                placeholder="Sala, laboratório ou Zoom"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo de local</Label>
                <Select
                  value={form.tipo_local}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo_local: v as AgendaLocationType }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Presencial</SelectItem>
                    <SelectItem value="classroom">Sala de aula</SelectItem>
                    <SelectItem value="lab">Laboratório</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cor do card</Label>
                <Select
                  value={form.tema}
                  onValueChange={(v) => setForm((f) => ({ ...f, tema: v as AgendaTheme }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dia da semana</Label>
              <Select
                value={String(form.dia_semana)}
                onValueChange={(v) => setForm((f) => ({ ...f, dia_semana: Number.parseInt(v, 10) }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_COLUMNS.map((d) => (
                    <SelectItem key={d.dia} value={String(d.dia)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hi">Início</Label>
                <Input
                  id="hi"
                  type="time"
                  value={formatTimeShort(form.hora_inicio)}
                  onChange={(e) => setForm((f) => ({ ...f, hora_inicio: normalizeTimeForApi(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hf">Fim</Label>
                <Input
                  id="hf"
                  type="time"
                  value={formatTimeShort(form.hora_fim)}
                  onChange={(e) => setForm((f) => ({ ...f, hora_fim: normalizeTimeForApi(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3">
            <div>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-md"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
