"use client"

import { useEffect, useState } from "react"
import { apiService, type ApiUniversidade, type ApiCurso } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiStatus<T> {
  loading: boolean
  data: T | null
  error: string | null
}

interface TestStatus {
  universidades: ApiStatus<ApiUniversidade[]>
  cursos: ApiStatus<ApiCurso[]>
}

export function ApiTest() {
  const [status, setStatus] = useState<TestStatus>({
    universidades: { loading: true, data: null, error: null },
    cursos: { loading: true, data: null, error: null },
  })

  useEffect(() => {
    const testApis = async () => {
      // Testar universidades
      try {
        console.log("🧪 Testando API de universidades...")
        const universidades = await apiService.getUniversidades()
        console.log("✅ Universidades:", universidades)
        setStatus((prev) => ({
          ...prev,
          universidades: { loading: false, data: universidades, error: null },
        }))
      } catch (error: any) {
        console.error("❌ Erro universidades:", error)
        setStatus((prev) => ({
          ...prev,
          universidades: { loading: false, data: null, error: error.message || "Erro desconhecido" },
        }))
      }

      // Testar cursos
      try {
        console.log("🧪 Testando API de cursos...")
        const cursos = await apiService.getCursos()
        console.log("✅ Cursos:", cursos)
        setStatus((prev) => ({
          ...prev,
          cursos: { loading: false, data: cursos, error: null },
        }))
      } catch (error: any) {
        console.error("❌ Erro cursos:", error)
        setStatus((prev) => ({
          ...prev,
          cursos: { loading: false, data: null, error: error.message || "Erro desconhecido" },
        }))
      }
    }

    testApis()
  }, [])

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🧪 Teste da API</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Universidades:</h4>
            {status.universidades.loading ? (
              <p>Carregando...</p>
            ) : status.universidades.error ? (
              <p className="text-red-600">Erro: {status.universidades.error}</p>
            ) : (
              <div>
                <p className="text-green-600">✅ {status.universidades.data?.length || 0} universidades carregadas</p>
                {status.universidades.data && status.universidades.data.length > 0 && (
                  <div className="text-xs mt-2 max-h-32 overflow-y-auto">
                    {status.universidades.data.map((u) => (
                      <p key={u.id}>
                        - {String(u.nome)} ({String(u.polo)}) - ID: {String(u.id)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold">Cursos:</h4>
            {status.cursos.loading ? (
              <p>Carregando...</p>
            ) : status.cursos.error ? (
              <p className="text-red-600">Erro: {status.cursos.error}</p>
            ) : (
              <div>
                <p className="text-green-600">✅ {status.cursos.data?.length || 0} cursos carregados</p>
                {status.cursos.data && status.cursos.data.length > 0 && (
                  <div className="text-xs mt-2 max-h-32 overflow-y-auto">
                    {status.cursos.data.map((c) => (
                      <p key={c.id}>
                        - {String(c.nome)} (Univ:{" "}
                        {typeof c.universidade === "object" ? String(c.universidade.nome) : String(c.universidade)}) -
                        ID: {String(c.id)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Exportação default também para compatibilidade
export default ApiTest
