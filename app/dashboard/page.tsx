"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/Navigation"
import { CheckCircle, Circle, Lock, BookOpen } from "lucide-react"

import { curriculumData } from "@/data/curriculum"

export default function DashboardPage() {
  const { user, toggleSubject } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const curriculum = curriculumData.gradesCurriculares.find(
    (grade) => grade.universidade === user.university && grade.polo === user.city && grade.curso === user.course,
  )

  const disciplinesByPeriod =
    curriculum?.disciplinas.reduce(
      (acc, discipline) => {
        const period = `${discipline.periodo}º Período`
        if (!acc[period]) {
          acc[period] = []
        }
        acc[period].push(discipline)
        return acc
      },
      {} as { [key: string]: any[] },
    ) || {}

  const isSubjectAvailable = (subject: any) => {
    if (subject.preRequisitos.length === 0) return true
    return subject.preRequisitos.every((prereq: string) => user.completedSubjects.includes(prereq))
  }

  const getSubjectStatus = (subject: any) => {
    if (user.completedSubjects.includes(subject.id)) {
      return { status: "completed", icon: CheckCircle, color: "bg-green-100 text-green-800" }
    }
    if (isSubjectAvailable(subject)) {
      return { status: "available", icon: Circle, color: "bg-blue-100 text-blue-800" }
    }
    return { status: "locked", icon: Lock, color: "bg-gray-100 text-gray-600" }
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
          {Object.entries(disciplinesByPeriod).map(([period, subjects]) => (
            <Card key={period} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-5 h-5" />
                  {period}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => {
                    const { status, icon: Icon, color } = getSubjectStatus(subject)

                    return (
                      <div
                        key={subject.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          status === "locked"
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          if (status !== "locked") {
                            toggleSubject(subject.id)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{subject.nome}</h3>
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 ml-2 ${
                              status === "completed"
                                ? "text-green-600"
                                : status === "available"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                            }`}
                          />
                        </div>

                        <Badge variant="secondary" className={`text-xs ${color}`}>
                          {status === "completed" ? "Cursada" : status === "available" ? "Disponível" : "Bloqueada"}
                        </Badge>

                        {subject.preRequisitos.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Pré-requisitos:</p>
                            <div className="flex flex-wrap gap-1">
                              {subject.preRequisitos.map((prereqId: string) => {
                                const prereqSubject = curriculum?.disciplinas.find((s: any) => s.id === prereqId)

                                return (
                                  <Badge
                                    key={prereqId}
                                    variant="outline"
                                    className={`text-xs ${
                                      user.completedSubjects.includes(prereqId)
                                        ? "border-green-300 text-green-700"
                                        : "border-red-300 text-red-700"
                                    }`}
                                  >
                                    {prereqSubject?.nome || prereqId}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {!curriculum && (
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
              <span>Disciplina cursada</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-blue-600" />
              <span>Disciplina disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Disciplina bloqueada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
