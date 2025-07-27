"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/Navigation"
import { CheckCircle, Circle, Lock, BookOpen, Clock, Play } from "lucide-react"
import { useUniversidades, useCursos, useDisciplinas } from "@/hooks/useApiData"
import type { ApiDisciplina } from "@/lib/api"

export default function DashboardPage() {
  const { user, updateSubjectStatus, removeSubjectStatus } = useAuth()
  const router = useRouter()
  const { universidades, loading: universitiesLoading } = useUniversidades()
  const { cursos, loading: cursosLoading } = useCursos()

  // Estado para o curso do usuário e disciplinas
  const [userCursoId, setUserCursoId] = useState<number | null>(null)
  const { disciplinas, loading: disciplinasLoading } = useDisciplinas(userCursoId)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Encontrar o curso do usuário quando os dados estiverem carregados
    if (
      !universitiesLoading &&
      !cursosLoading &&
      Array.isArray(universidades) &&
      universidades.length > 0 &&
      Array.isArray(cursos) &&
      cursos.length > 0
    ) {
      // Primeiro encontrar a universidade
      const userUniversidade = universidades.find((u) => u.nome === user.university && u.polo === user.city)

      if (userUniversidade) {
        // Depois encontrar o curso baseado no ID da universidade
        const userCurso = cursos.find((c) => {
          if (c.nome === user.course) {
            const cursoUnivId = typeof c.universidade === "object" ? c.universidade.id : c.universidade
            return cursoUnivId === userUniversidade.id
          }
          return false
        })

        if (userCurso) {
          setUserCursoId(userCurso.id)
          console.log("✅ Curso do usuário encontrado:", userCurso)
        }
      }
    }
  }, [user, router, universidades, cursos, universitiesLoading, cursosLoading])

  if (!user) {
    return null
  }

  if (universitiesLoading || cursosLoading || disciplinasLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando disciplinas...</p>
          </div>
        </div>
      </div>
    )
  }

  // Verificações de segurança para arrays
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

  // ADICIONAR: Ordenar os períodos de forma crescente
  const sortedPeriods = Object.keys(disciplinesByPeriod).sort((a, b) => {
    // Extrair o número do período (ex: "1º Período" -> 1)
    const periodA = Number.parseInt(a.match(/(\d+)º/)?.[1] || "0")
    const periodB = Number.parseInt(b.match(/(\d+)º/)?.[1] || "0")
    return periodA - periodB
  })

  // CORRIGINDO A LÓGICA DE PRÉ-REQUISITOS
  const isSubjectAvailable = (subject: ApiDisciplina): boolean => {
    // Verificação de segurança para preRequisitos
    const preRequisitos = Array.isArray(subject.preRequisitos) ? subject.preRequisitos : []

    // Se não tem pré-requisitos, está disponível
    if (preRequisitos.length === 0) return true

    // Verificar se TODOS os pré-requisitos estão CONCLUÍDOS
    const completedSubjects = Array.isArray(user.completedSubjects) ? user.completedSubjects : []

    console.log(`🔍 Verificando pré-requisitos para ${subject.nome}:`, {
      disciplinaId: subject.id,
      preRequisitos,
      completedSubjects,
      todosCompletos: preRequisitos.every((prereq: number) => completedSubjects.includes(prereq)),
    })

    return preRequisitos.every((prereq: number) => completedSubjects.includes(prereq))
  }

  const getSubjectStatus = (subject: ApiDisciplina) => {
    // Primeiro verificar se a disciplina está bloqueada por pré-requisitos
    const isAvailable = isSubjectAvailable(subject)

    // Se não está disponível (pré-requisitos não atendidos), está bloqueada
    if (!isAvailable) {
      return {
        status: "locked",
        icon: Lock,
        color: "bg-red-100 text-red-800", // Mudando para vermelho para indicar bloqueio
        label: "Bloqueada - Pré-requisitos",
      }
    }

    // Se está disponível, verificar o status atual
    const currentStatus = user.subjectStatuses[subject.id]

    if (currentStatus === "concluida") {
      return {
        status: "concluida",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
        label: "Concluída",
      }
    }

    if (currentStatus === "em_andamento") {
      return {
        status: "em_andamento",
        icon: Play,
        color: "bg-blue-100 text-blue-800",
        label: "Em Andamento",
      }
    }

    if (currentStatus === "pendente") {
      return {
        status: "pendente",
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
        label: "Pendente",
      }
    }

    // Se não tem status mas está disponível
    return {
      status: "available",
      icon: Circle,
      color: "bg-gray-100 text-gray-600",
      label: "Disponível",
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planejamento de Disciplinas</h1>
          <div className="text-gray-600 space-y-1">
            <p>
              <span className="font-semibold">Universidade:</span> {user.university}
            </p>
            <p>
              <span className="font-semibold">Polo:</span> {user.city}
            </p>
            <p>
              <span className="font-semibold">Curso:</span> {user.course}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {sortedPeriods.map((period) => (
            <Card key={period} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-5 h-5" />
                  {period}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {disciplinesByPeriod[period].map((subject) => {
                    const { status, icon: Icon, color, label } = getSubjectStatus(subject)
                    const preRequisitos = Array.isArray(subject.preRequisitos) ? subject.preRequisitos : []
                    const completedSubjects = Array.isArray(user.completedSubjects) ? user.completedSubjects : []

                    // Obter o status atual da disciplina
                    const currentStatus = user.subjectStatuses[subject.id]

                    // Verificar se está bloqueada
                    const isBlocked = status === "locked"

                    return (
                      <div
                        key={subject.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isBlocked
                            ? "border-red-200 bg-red-50 opacity-75" // Visual diferente para bloqueadas
                            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3
                            className={`font-semibold text-sm leading-tight ${
                              isBlocked ? "text-red-700" : "text-gray-900"
                            }`}
                          >
                            {subject.nome}
                          </h3>
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 ml-2 ${
                              status === "concluida"
                                ? "text-green-600"
                                : status === "em_andamento"
                                  ? "text-blue-600"
                                  : status === "pendente"
                                    ? "text-yellow-600"
                                    : status === "available"
                                      ? "text-gray-600"
                                      : "text-red-500" // Vermelho para bloqueadas
                            }`}
                          />
                        </div>

                        <Badge variant="secondary" className={`text-xs ${color} mb-3`}>
                          {label}
                        </Badge>

                        {/* Botões de ação apenas para disciplinas NÃO bloqueadas */}
                        {!isBlocked && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {/* Botão Concluir */}
                            <Button
                              size="sm"
                              variant={currentStatus === "concluida" ? "default" : "outline"}
                              className={`text-xs h-6 px-2 ${
                                currentStatus === "concluida"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "hover:bg-green-50 hover:border-green-300"
                              }`}
                              onClick={() =>
                                handleStatusChange(subject.id, currentStatus === "concluida" ? "remove" : "concluida")
                              }
                            >
                              {currentStatus === "concluida" ? "✓ Concluída" : "Concluir"}
                            </Button>

                            {/* Botão Em Andamento */}
                            <Button
                              size="sm"
                              variant={currentStatus === "em_andamento" ? "default" : "outline"}
                              className={`text-xs h-6 px-2 ${
                                currentStatus === "em_andamento"
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "hover:bg-blue-50 hover:border-blue-300"
                              }`}
                              onClick={() =>
                                handleStatusChange(
                                  subject.id,
                                  currentStatus === "em_andamento" ? "remove" : "em_andamento",
                                )
                              }
                            >
                              {currentStatus === "em_andamento" ? "▶ Em Andamento" : "Iniciar"}
                            </Button>

                            {/* Botão Pendente */}
                            <Button
                              size="sm"
                              variant={currentStatus === "pendente" ? "default" : "outline"}
                              className={`text-xs h-6 px-2 ${
                                currentStatus === "pendente"
                                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                  : "hover:bg-yellow-50 hover:border-yellow-300"
                              }`}
                              onClick={() =>
                                handleStatusChange(subject.id, currentStatus === "pendente" ? "remove" : "pendente")
                              }
                            >
                              {currentStatus === "pendente" ? "⏰ Pendente" : "Planejar"}
                            </Button>
                          </div>
                        )}

                        {/* Mostrar pré-requisitos sempre, com indicação visual melhor */}
                        {preRequisitos.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">
                              Pré-requisitos {isBlocked ? "(não atendidos)" : "(atendidos)"}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {preRequisitos.map((prereqId: number) => {
                                const prereqSubject = safeDisciplinas.find((s) => s.id === prereqId)
                                const isPrereqCompleted = completedSubjects.includes(prereqId)

                                return (
                                  <Badge
                                    key={prereqId}
                                    variant="outline"
                                    className={`text-xs ${
                                      isPrereqCompleted
                                        ? "border-green-300 text-green-700 bg-green-50"
                                        : "border-red-300 text-red-700 bg-red-50"
                                    }`}
                                  >
                                    {isPrereqCompleted ? "✓" : "✗"} {prereqSubject?.nome || `ID: ${prereqId}`}
                                  </Badge>
                                )
                              })}
                            </div>

                            {/* Mensagem explicativa para disciplinas bloqueadas */}
                            {isBlocked && (
                              <p className="text-xs text-red-600 mt-2 italic">
                                Complete os pré-requisitos marcados com ✗ para liberar esta disciplina
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {sortedPeriods.length === 0 && (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Currículo não encontrado</h3>
                <p className="text-gray-600">
                  Não foi possível encontrar o currículo para a combinação:
                  <br />
                  <strong>{user.university}</strong> - <strong>{user.city}</strong> - <strong>{user.course}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">Verifique se suas informações de perfil estão corretas.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Legenda:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Disciplina concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              <span>Em andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>Pendente/Planejada</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-600" />
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Bloqueada por pré-requisitos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
