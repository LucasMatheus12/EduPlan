"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "@/lib/api"

export interface User {
  id: number
  name: string
  email: string
  university: string // Nome da universidade (para exibição)
  city: string
  course: string // Nome do curso (para exibição)
  universityId: number // ID da universidade (para API)
  courseId: number // ID do curso (para API)
  // Sistema de status das disciplinas
  subjectStatuses: { [subjectId: number]: "concluida" | "em_andamento" | "pendente" }
  completedSubjects: number[] // Mantendo para compatibilidade (disciplinas concluídas)
  schedule: { [key: string]: string }
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  university: string // Nome da universidade
  city: string
  course: string // Nome do curso
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateUser: (
    userData: Partial<Omit<User, "id" | "completedSubjects" | "schedule" | "subjectStatuses">>,
  ) => Promise<void>
  // Funções para gerenciar status das disciplinas
  updateSubjectStatus: (subjectId: number, status: "concluida" | "em_andamento" | "pendente") => Promise<void>
  removeSubjectStatus: (subjectId: number) => Promise<void>
  updateSchedule: (day: string, time: string, subject: string) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function para converter ApiUser para User
  const convertApiUserToUser = async (apiUser: any): Promise<User> => {
    try {
      // Buscar dados das universidades e cursos para converter IDs em nomes
      const [universidades, cursos] = await Promise.all([apiService.getUniversidades(), apiService.getCursos()])

      const universidade = universidades.find((u) => u.id === apiUser.university)

      // Encontrar o curso do usuário
      const curso = cursos.find((c) => {
        if (c.id === apiUser.course) {
          // Verificar se a universidade do curso corresponde
          const cursoUnivId = typeof c.universidade === "object" ? c.universidade.id : c.universidade
          return cursoUnivId === apiUser.university
        }
        return false
      })

      return {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        university: universidade?.nome || "Universidade não encontrada",
        city: apiUser.city,
        course: curso?.nome || "Curso não encontrado",
        universityId: apiUser.university,
        courseId: apiUser.course,
        subjectStatuses: {},
        completedSubjects: [],
        schedule: {},
      }
    } catch (error) {
      console.error("Erro ao converter ApiUser:", error)
      throw error
    }
  }

  // Helper function para processar status das disciplinas
  const processSubjectStatuses = (userDisciplinas: any[]) => {
    const subjectStatuses: { [subjectId: number]: "concluida" | "em_andamento" | "pendente" } = {}
    const completedSubjects: number[] = []

    userDisciplinas.forEach((ud) => {
      subjectStatuses[ud.disciplina] = ud.status
      if (ud.status === "concluida") {
        completedSubjects.push(ud.disciplina)
      }
    })

    return { subjectStatuses, completedSubjects }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("currentUser")
      const accessToken = localStorage.getItem("access_token")

      if (savedUser && accessToken) {
        try {
          console.log("🔄 Inicializando autenticação...")

          // Tentar buscar dados atualizados do usuário usando o token
          const apiUser = await apiService.getCurrentUser()
          const userDisciplinas = await apiService.getUsuarioDisciplinas(apiUser.id)

          const { subjectStatuses, completedSubjects } = processSubjectStatuses(userDisciplinas)

          const fullUser = await convertApiUserToUser(apiUser)
          fullUser.subjectStatuses = subjectStatuses
          fullUser.completedSubjects = completedSubjects
          fullUser.schedule = JSON.parse(localStorage.getItem(`schedule_${apiUser.id}`) || "{}")

          setUser(fullUser)
          console.log("✅ Usuário autenticado:", fullUser)
        } catch (error) {
          console.error("❌ Erro ao carregar dados do usuário:", error)
          // Limpar dados inválidos
          localStorage.removeItem("currentUser")
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          apiService.logout()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
        }),
      )
      localStorage.setItem(`schedule_${user.id}`, JSON.stringify(user.schedule))
    }
  }, [user])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log("🚀 Tentando fazer login com:", { username: email, password: "***" })

      // Fazer login e receber tokens + dados do usuário
      const loginResult = await apiService.login({
        username: email, // A API espera username, mas usamos email
        password,
      })

      console.log("✅ Login bem-sucedido:", loginResult)

      const apiUser = loginResult.user
      const userDisciplinas = await apiService.getUsuarioDisciplinas(apiUser.id)

      const { subjectStatuses, completedSubjects } = processSubjectStatuses(userDisciplinas)

      const fullUser = await convertApiUserToUser(apiUser)
      fullUser.subjectStatuses = subjectStatuses
      fullUser.completedSubjects = completedSubjects
      fullUser.schedule = JSON.parse(localStorage.getItem(`schedule_${apiUser.id}`) || "{}")

      setUser(fullUser)
      return true
    } catch (error) {
      console.error("❌ Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      console.log("🚀 Tentando registrar usuário:", userData)

      // Buscar universidades e cursos para converter nomes em IDs
      const [universidades, cursos] = await Promise.all([apiService.getUniversidades(), apiService.getCursos()])

      // Encontrar a universidade pelo nome e polo
      const universidade = universidades.find((u) => u.nome === userData.university && u.polo === userData.city)

      if (!universidade) {
        throw new Error(`Universidade não encontrada: ${userData.university} - ${userData.city}`)
      }

      // Encontrar o curso pelo nome e universidade
      const curso = cursos.find((c) => {
        if (c.nome === userData.course) {
          const cursoUnivId = typeof c.universidade === "object" ? c.universidade.id : c.universidade
          return cursoUnivId === universidade.id
        }
        return false
      })

      if (!curso) {
        throw new Error(`Curso não encontrado: ${userData.course} na ${userData.university} - ${userData.city}`)
      }

      console.log("🔍 IDs encontrados:", {
        universidadeId: universidade.id,
        cursoId: curso.id,
      })

      // Preparar dados para a API
      const apiData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        university: universidade.id,
        city: userData.city,
        course: curso.id,
      }

      console.log("📤 Enviando para API:", apiData)

      const apiUser = await apiService.register(apiData)

      console.log("✅ Usuário registrado com sucesso:", apiUser)

      // Após registrar, fazer login automaticamente
      const loginSuccess = await login(userData.email, userData.password)

      return loginSuccess
    } catch (error) {
      console.error("❌ Register error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    if (user) {
      localStorage.removeItem(`schedule_${user.id}`)
    }
    apiService.logout()
  }

  const updateUser = async (
    userData: Partial<Omit<User, "id" | "completedSubjects" | "schedule" | "subjectStatuses">>,
  ) => {
    if (!user) return

    try {
      // Converter nomes de volta para IDs se necessário
      const updateData: any = { ...userData }

      if (userData.university || userData.city || userData.course) {
        const [universidades, cursos] = await Promise.all([apiService.getUniversidades(), apiService.getCursos()])

        if (userData.university && userData.city) {
          const universidade = universidades.find((u) => u.nome === userData.university && u.polo === userData.city)
          if (universidade) {
            updateData.university = universidade.id
          }
        }

        if (userData.course && updateData.university) {
          const curso = cursos.find((c) => {
            if (c.nome === userData.course) {
              const cursoUnivId = typeof c.universidade === "object" ? c.universidade.id : c.universidade
              return cursoUnivId === updateData.university
            }
            return false
          })
          if (curso) {
            updateData.course = curso.id
          }
        }
      }

      const updatedApiUser = await apiService.updateUser(user.id, updateData)
      const updatedUser = await convertApiUserToUser(updatedApiUser)
      updatedUser.subjectStatuses = user.subjectStatuses
      updatedUser.completedSubjects = user.completedSubjects
      updatedUser.schedule = user.schedule

      setUser(updatedUser)
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  }

  // NOVA FUNÇÃO: Atualizar status da disciplina usando a rota específica
  const updateSubjectStatus = async (subjectId: number, status: "concluida" | "em_andamento" | "pendente") => {
    if (!user) return

    try {
      console.log(`🔄 Atualizando status da disciplina ${subjectId} para ${status}`)

      // Usar a nova rota específica
      await apiService.updateDisciplinaStatus({
        disciplina: subjectId,
        status: status,
      })

      // Atualizar o estado local
      const updatedUserDisciplinas = await apiService.getUsuarioDisciplinas(user.id)
      const { subjectStatuses, completedSubjects } = processSubjectStatuses(updatedUserDisciplinas)

      setUser((prev) => (prev ? { ...prev, subjectStatuses, completedSubjects } : null))

      console.log(`✅ Status da disciplina ${subjectId} atualizado para ${status}`)
    } catch (error) {
      console.error("❌ Erro ao atualizar status da disciplina:", error)
      throw error
    }
  }

  // NOVA FUNÇÃO: Remover status da disciplina
  const removeSubjectStatus = async (subjectId: number) => {
    if (!user) return

    try {
      console.log(`🗑️ Removendo status da disciplina ${subjectId}`)

      // Usar a nova rota para remover status
      await apiService.removeDisciplinaStatus(subjectId)

      // Atualizar o estado local
      const updatedUserDisciplinas = await apiService.getUsuarioDisciplinas(user.id)
      const { subjectStatuses, completedSubjects } = processSubjectStatuses(updatedUserDisciplinas)

      setUser((prev) => (prev ? { ...prev, subjectStatuses, completedSubjects } : null))

      console.log(`✅ Status da disciplina ${subjectId} removido`)
    } catch (error) {
      console.error("❌ Erro ao remover status da disciplina:", error)
      throw error
    }
  }

  const updateSchedule = (day: string, time: string, subject: string) => {
    if (!user) return

    const scheduleKey = `${day}-${time}`
    const newSchedule = { ...user.schedule }

    if (subject.trim()) {
      newSchedule[scheduleKey] = subject
    } else {
      delete newSchedule[scheduleKey]
    }

    setUser((prev) => (prev ? { ...prev, schedule: newSchedule } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        updateSubjectStatus,
        removeSubjectStatus,
        updateSchedule,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
