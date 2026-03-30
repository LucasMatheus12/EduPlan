"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { PageHero } from "@/components/layout/PageHero"
import { WeeklyAgenda } from "@/components/schedule/WeeklyAgenda"
import { useAuth } from "@/contexts/AuthContext"
import { Calendar } from "lucide-react"

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
        <Navigation />
        <div className="mx-auto w-full max-w-[min(100%,100rem)] px-3 py-8 text-center sm:px-5 lg:px-6">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Carregando sessão...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      <Navigation />

      <div className="mx-auto w-full max-w-[min(100%,100rem)] px-3 py-8 sm:px-5 lg:px-6">
        <PageHero
          eyebrow="Organização"
          title="Agenda semanal"
          description="Grade em estilo acadêmico: visualize aulas por dia e faixa de horário. Os dados são salvos na sua conta (API)."
        >
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            <span>Segunda a sábado · clique em uma aula para editar ou use &quot;Adicionar&quot; em cada célula.</span>
          </div>
        </PageHero>

        <WeeklyAgenda userId={user.id} />

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-800">Como usar</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
            <li>Cada linha é uma faixa de tempo; o intervalo central separa manhã e tarde.</li>
            <li>Cartões azuis ou laranja indicam o tema escolhido; o ícone mostra o tipo de local.</li>
            <li>Horários podem ser ajustados no formulário — a aula aparece em todas as faixas em que o intervalo coincidir.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
