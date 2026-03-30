"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/Navigation"
import { CurriculumGradeGrid } from "@/components/curriculum/CurriculumGradeGrid"
import { CurriculumPipeline } from "@/components/curriculum/CurriculumPipeline"
import { PageHero, PageHeroMetaChip } from "@/components/layout/PageHero"
import {
  BookMarked,
  Building2,
  CheckCircle,
  Circle,
  LayoutGrid,
  Link2,
  Lock,
  BookOpen,
  Clock,
  MapPin,
  Play,
  Workflow,
} from "lucide-react"
import { useUniversidades, useCursos, useDisciplinas } from "@/hooks/useApiData"
import type { ApiDisciplina } from "@/lib/api"
export default function DashboardPage() {
  const { user, updateSubjectStatus, removeSubjectStatus, loading: authLoading } = useAuth()
  const router = useRouter()
  const { universidades, loading: universitiesLoading } = useUniversidades()
  const { cursos, loading: cursosLoading } = useCursos()

  const [userCursoId, setUserCursoId] = useState<number | null>(null)
  const { disciplinas, loading: disciplinasLoading } = useDisciplinas(userCursoId)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/")
      return
    }

    if (
      !universitiesLoading &&
      !cursosLoading &&
      Array.isArray(universidades) &&
      universidades.length > 0 &&
      Array.isArray(cursos) &&
      cursos.length > 0
    ) {
      const userUniversidade = universidades.find((u) => u.nome === user.university && u.polo === user.city)

      if (userUniversidade) {
        const userCurso = cursos.find((c) => {
          if (c.nome === user.course) {
            const cursoUnivId = typeof c.universidade === "object" ? c.universidade.id : c.universidade
            return cursoUnivId === userUniversidade.id
          }
          return false
        })

        if (userCurso) {
          setUserCursoId(userCurso.id)
        }
      }
    }
  }, [user, authLoading, router, universidades, cursos, universitiesLoading, cursosLoading])

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

  if (universitiesLoading || cursosLoading || disciplinasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
        <Navigation />
        <div className="mx-auto w-full max-w-[min(100%,100rem)] px-3 py-8 text-center sm:px-5 lg:px-6">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Carregando disciplinas...</p>
        </div>
      </div>
    )
  }

  const safeDisciplinas = Array.isArray(disciplinas) ? disciplinas : []

  const disciplinesByPeriod = safeDisciplinas.reduce(
    (acc, discipline) => {
      const period = `${discipline.periodo}º Período`
      if (!acc[period]) {
        acc[period] = []
      }
      acc[period].push(discipline)
      return acc
    },
    {} as { [key: string]: ApiDisciplina[] },
  )

  const sortedPeriods = Object.keys(disciplinesByPeriod).sort((a, b) => {
    const periodA = Number.parseInt(a.match(/(\d+)º/)?.[1] || "0")
    const periodB = Number.parseInt(b.match(/(\d+)º/)?.[1] || "0")
    return periodA - periodB
  })

  const handleStatusChange = async (
    subjectId: number,
    newStatus: "concluida" | "em_andamento" | "pendente" | "remove",
  ) => {
    try {
      if (newStatus === "remove") {
        await removeSubjectStatus(subjectId)
      } else {
        await updateSubjectStatus(subjectId, newStatus)
      }
    } catch (error) {
      console.error("Erro ao alterar status da disciplina:", error)
    }
  }

  const legend = (
    <div className="mt-8 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-white/80">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
        <span className="h-px w-8 shrink-0 bg-gradient-to-r from-transparent to-slate-200" aria-hidden />
        Legenda de status
        <span className="h-px flex-1 min-w-8 bg-gradient-to-l from-transparent to-slate-200" aria-hidden />
      </h3>
      <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-sky-600" />
          <span>Em andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span>Planejada</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-slate-400" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-rose-500" />
          <span>Bloqueada (pré-requisitos)</span>
        </div>
        <div className="flex w-full basis-full items-center gap-2 text-slate-500">
          <Link2 className="h-4 w-4 text-indigo-500" />
          <span>
            Co-requisitos aparecem em destaque no card (cursar no mesmo período; não bloqueiam sozinhos).
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      <Navigation />

      <div className="mx-auto w-full max-w-[min(100%,100rem)] px-3 py-8 sm:px-5 lg:px-6">
        <PageHero
          eyebrow="Seu planejamento"
          title="Disciplinas e trilha do curso"
          description="Grade com carga horária e créditos (PPC), pré-requisitos para desbloqueio e co-requisitos (disciplinas do mesmo período). Atualize seu status conforme avança no curso."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PageHeroMetaChip
              label="Universidade"
              value={user.university}
              icon={<Building2 className="h-5 w-5" aria-hidden />}
            />
            <PageHeroMetaChip
              label="Polo / cidade"
              value={user.city}
              icon={<MapPin className="h-5 w-5" aria-hidden />}
            />
            <PageHeroMetaChip
              label="Curso"
              value={user.course}
              icon={<BookMarked className="h-5 w-5" aria-hidden />}
            />
          </div>
        </PageHero>

        {sortedPeriods.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Currículo não encontrado</h3>
              <p className="text-slate-600">
                Não foi possível encontrar o currículo para a combinação:
                <br />
                <strong>{user.university}</strong> — <strong>{user.city}</strong> — <strong>{user.course}</strong>
              </p>
              <p className="mt-2 text-sm text-slate-500">Verifique se as informações do perfil estão corretas.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="pipeline" className="w-full">
            <TabsList className="mb-8 grid h-auto w-full max-w-xl grid-cols-2 gap-2 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-slate-100/80 via-white/90 to-slate-100/80 p-1.5 shadow-inner">
              <TabsTrigger
                value="pipeline"
                className="gap-2 rounded-xl py-3.5 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25"
              >
                <Workflow className="h-4 w-4 shrink-0" />
                Trilha (pipeline)
              </TabsTrigger>
              <TabsTrigger
                value="grid"
                className="gap-2 rounded-xl py-3.5 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                Grade por período
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="mt-0 outline-none">
              <CurriculumPipeline
                sortedPeriods={sortedPeriods}
                disciplinesByPeriod={disciplinesByPeriod}
                safeDisciplinas={safeDisciplinas}
                user={user}
                onStatusChange={handleStatusChange}
              />
              {legend}
            </TabsContent>

            <TabsContent value="grid" className="mt-0 outline-none">
              <CurriculumGradeGrid
                sortedPeriods={sortedPeriods}
                disciplinesByPeriod={disciplinesByPeriod}
                safeDisciplinas={safeDisciplinas}
                user={user}
                onStatusChange={handleStatusChange}
              />
              {legend}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
