"use client"

import { useState, useEffect } from "react"
import { apiService, type ApiUniversidade, type ApiCurso, type ApiDisciplina } from "@/lib/api"

export function useUniversidades() {
  const [universidades, setUniversidades] = useState<ApiUniversidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUniversidades = async () => {
      try {
        console.log("🔄 Buscando universidades...") // Debug
        setLoading(true)
        setError(null)

        const data = await apiService.getUniversidades()
        console.log("✅ Universidades carregadas:", data) // Debug

        // Verificação de segurança - garantir que é um array
        const safeData = Array.isArray(data) ? data : []
        setUniversidades(safeData)
      } catch (err) {
        const errorMessage = "Erro ao carregar universidades"
        console.error("❌ Erro ao buscar universidades:", err) // Debug
        setError(errorMessage)
        setUniversidades([]) // Garantir que seja um array vazio em caso de erro
      } finally {
        setLoading(false)
      }
    }

    fetchUniversidades()
  }, [])

  return { universidades, loading, error }
}

export function useCursos() {
  const [cursos, setCursos] = useState<ApiCurso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        console.log("🔄 Buscando cursos...") // Debug
        setLoading(true)
        setError(null)

        const data = await apiService.getCursos()
        console.log("✅ Cursos carregados:", data) // Debug

        // Verificação de segurança - garantir que é um array
        const safeData = Array.isArray(data) ? data : []
        setCursos(safeData)
      } catch (err) {
        const errorMessage = "Erro ao carregar cursos"
        console.error("❌ Erro ao buscar cursos:", err) // Debug
        setError(errorMessage)
        setCursos([]) // Garantir que seja um array vazio em caso de erro
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [])

  return { cursos, loading, error }
}

export function useDisciplinas(cursoId?: number | null) {
  const [disciplinas, setDisciplinas] = useState<ApiDisciplina[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cursoId) {
      setDisciplinas([])
      setLoading(false)
      return
    }

    const fetchDisciplinas = async () => {
      try {
        console.log(`🔄 Buscando disciplinas para curso ${cursoId}...`) // Debug
        setLoading(true)
        setError(null)

        const data = await apiService.getDisciplinasByCurso(cursoId)
        console.log("✅ Disciplinas carregadas:", data) // Debug

        // Verificação de segurança - garantir que é um array e normalizar pré-requisitos
        const safeData = Array.isArray(data)
          ? data.map((disciplina) => ({
              ...disciplina,
              // Normalizar pré-requisitos - usar pre_requisitos se existir, senão preRequisitos
              preRequisitos: Array.isArray(disciplina.pre_requisitos)
                ? disciplina.pre_requisitos
                : Array.isArray(disciplina.preRequisitos)
                  ? disciplina.preRequisitos
                  : [],
            }))
          : []

        setDisciplinas(safeData)
      } catch (err) {
        const errorMessage = "Erro ao carregar disciplinas"
        console.error("❌ Erro ao buscar disciplinas:", err) // Debug
        setError(errorMessage)
        setDisciplinas([])
      } finally {
        setLoading(false)
      }
    }

    fetchDisciplinas()
  }, [cursoId])

  const refetch = async () => {
    if (!cursoId) return

    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getDisciplinasByCurso(cursoId)

      // Verificação de segurança e normalização
      const safeData = Array.isArray(data)
        ? data.map((disciplina) => ({
            ...disciplina,
            preRequisitos: Array.isArray(disciplina.pre_requisitos)
              ? disciplina.pre_requisitos
              : Array.isArray(disciplina.preRequisitos)
                ? disciplina.preRequisitos
                : [],
          }))
        : []

      setDisciplinas(safeData)
    } catch (err) {
      const errorMessage = "Erro ao carregar disciplinas"
      setError(errorMessage)
      setDisciplinas([])
    } finally {
      setLoading(false)
    }
  }

  return {
    disciplinas,
    loading,
    error,
    refetch,
  }
}
