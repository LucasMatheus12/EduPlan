const API_BASE_URL = "http://localhost:8000"

export interface ApiUser {
  id: number
  name: string
  email: string
  username?: string
  university: number // ID da universidade
  city: string
  course: number // ID do curso
}

export interface ApiUniversidade {
  id: number
  nome: string
  polo: string
}

export interface ApiCurso {
  id: number
  nome: string
  universidade: ApiUniversidade // Objeto completo da universidade
}

// CORRIGINDO O NOME DO CAMPO - parece que a API usa "pre_requisitos" em vez de "preRequisitos"
export interface ApiDisciplina {
  id: number
  nome: string
  periodo: number
  curso: number
  carga_horaria?: number | null
  creditos?: number | null
  pre_requisitos?: number[]
  co_requisitos?: number[]
  preRequisitos?: number[]
  coRequisitos?: number[]
}

export interface ApiUsuarioDisciplina {
  id: number
  usuario: number
  disciplina: number
  status: "concluida" | "em_andamento" | "pendente"
}

export interface LoginRequest {
  username: string
  password: string
}

export interface JWTTokenResponse {
  access: string
  refresh: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  university: number // ID da universidade
  city: string
  course: number // ID do curso
}

// Nova interface para o update de status
export interface UpdateStatusRequest {
  status: "concluida" | "em_andamento" | "pendente"
  disciplina: number
}

export type AgendaLocationType = "physical" | "online" | "lab" | "classroom"
export type AgendaTheme = "blue" | "orange"

export interface ApiAgendaItem {
  id: number
  titulo: string
  local_nome: string
  tipo_local: AgendaLocationType
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  tema: AgendaTheme
}

export interface AgendaItemPayload {
  titulo: string
  local_nome?: string
  tipo_local: AgendaLocationType
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  tema: AgendaTheme
}

class ApiService {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Recuperar tokens do localStorage se existirem
    if (typeof window !== "undefined") {
      this.syncTokensFromStorage()
    }
  }

  /** Sempre ler do localStorage antes de usar tokens (Next.js/hidratação podem deixar a memória dessincronizada). */
  private syncTokensFromStorage(): void {
    if (typeof window === "undefined") return
    this.accessToken = localStorage.getItem("access_token")
    this.refreshToken = localStorage.getItem("refresh_token")
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    this.syncTokensFromStorage()
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    this.syncTokensFromStorage()
    const url = `${API_BASE_URL}${endpoint}`

    console.log(`API Request: ${options?.method || "GET"} ${url}`)

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
    }

    if (options?.body) {
      console.log("Request body:", options.body)
    }

    try {
      const response = await fetch(url, config)

      console.log(`API Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        // Se for erro 401, tentar refresh do token
        if (response.status === 401 && this.refreshToken) {
          console.log("🔄 Tentando refresh do token...")
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            // Tentar a requisição novamente com o novo token
            const retryConfig: RequestInit = {
              ...options,
              headers: {
                ...this.getAuthHeaders(),
                ...options?.headers,
              },
            }
            const retryResponse = await fetch(url, retryConfig)
            if (retryResponse.ok) {
              const data = await retryResponse.json()
              console.log("API Response data (after refresh):", data)
              return data
            }
          }
        }

        // Se chegou aqui, limpar tokens
        this.clearTokens()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log("API Response data:", data)
      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)
    }
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    this.syncTokensFromStorage()
    if (!this.refreshToken) return false

    try {
      const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: this.refreshToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.access
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", data.access)
        }
        console.log("✅ Token refreshed successfully")
        return true
      }
    } catch (error) {
      console.error("❌ Error refreshing token:", error)
    }

    return false
  }

  // Função para decodificar JWT e extrair user_id
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error decoding JWT:", error)
      return null
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<{ user: ApiUser; tokens: JWTTokenResponse }> {
    console.log("🚀 Fazendo login com:", credentials)

    const tokenResponse = await this.request<JWTTokenResponse>("/api/token/", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    console.log("✅ Tokens recebidos:", tokenResponse)

    // Salvar tokens
    this.setTokens(tokenResponse.access, tokenResponse.refresh)

    // Decodificar o token para obter o user_id
    const decodedToken = this.decodeJWT(tokenResponse.access)
    console.log("🔍 Token decodificado:", decodedToken)

    if (!decodedToken || !decodedToken.user_id) {
      throw new Error("Token inválido - não foi possível extrair user_id")
    }

    // Buscar dados do usuário usando o user_id do token
    const user = await this.getUser(Number.parseInt(decodedToken.user_id))

    return {
      user,
      tokens: tokenResponse,
    }
  }

  async register(userData: RegisterRequest): Promise<ApiUser> {
    return this.request<ApiUser>("/api/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  logout() {
    this.clearTokens()
  }

  // Users endpoints
  async getUser(id: number): Promise<ApiUser> {
    return this.request<ApiUser>(`/api/users/${id}/`)
  }

  async getCurrentUser(): Promise<ApiUser> {
    this.syncTokensFromStorage()
    if (!this.accessToken && this.refreshToken) {
      const refreshed = await this.refreshAccessToken()
      if (!refreshed) {
        throw new Error("Sessão expirada")
      }
    }
    if (!this.accessToken) {
      throw new Error("Não há token de acesso")
    }

    const decodedToken = this.decodeJWT(this.accessToken)
    if (!decodedToken || !decodedToken.user_id) {
      throw new Error("Token inválido")
    }

    return this.getUser(Number.parseInt(decodedToken.user_id))
  }

  async updateUser(id: number, userData: Partial<ApiUser>): Promise<ApiUser> {
    return this.request<ApiUser>(`/api/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  }

  // Universidades endpoints
  async getUniversidades(): Promise<ApiUniversidade[]> {
    return this.request<ApiUniversidade[]>("/api/universidades/")
  }

  // Cursos endpoints
  async getCursos(): Promise<ApiCurso[]> {
    return this.request<ApiCurso[]>("/api/cursos/")
  }

  async getCursosByUniversidade(universidadeId: number): Promise<ApiCurso[]> {
    return this.request<ApiCurso[]>(`/api/cursos/?universidade=${universidadeId}`)
  }

  // Disciplinas endpoints
  async getDisciplinas(): Promise<ApiDisciplina[]> {
    return this.request<ApiDisciplina[]>("/api/disciplinas/")
  }

  async getDisciplinasByCurso(cursoId: number): Promise<ApiDisciplina[]> {
    return this.request<ApiDisciplina[]>(`/api/disciplinas/?curso=${cursoId}`)
  }

  // Usuario-disciplinas endpoints
  async getUsuarioDisciplinas(usuarioId: number): Promise<ApiUsuarioDisciplina[]> {
    return this.request<ApiUsuarioDisciplina[]>(`/api/usuario-disciplinas/?usuario=${usuarioId}`)
  }

  // Usar a rota específica para atualizar status
  async updateDisciplinaStatus(data: UpdateStatusRequest): Promise<ApiUsuarioDisciplina> {
    console.log("🔄 Atualizando status da disciplina:", data)

    return this.request<ApiUsuarioDisciplina>("/api/usuario-disciplinas/update-status/", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Remover status da disciplina
  async removeDisciplinaStatus(disciplinaId: number): Promise<void> {
    console.log("🗑️ Removendo status da disciplina:", disciplinaId)

    return this.request<void>(`/api/usuario-disciplinas/remove-status/`, {
      method: "DELETE",
      body: JSON.stringify({ disciplina: disciplinaId }),
    })
  }

  // Manter funções antigas para compatibilidade
  async createUsuarioDisciplina(data: {
    usuario: number
    disciplina: number
    status: "concluida" | "em_andamento" | "pendente"
  }): Promise<ApiUsuarioDisciplina> {
    return this.request<ApiUsuarioDisciplina>("/api/usuario-disciplinas/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUsuarioDisciplina(id: number, data: Partial<ApiUsuarioDisciplina>): Promise<ApiUsuarioDisciplina> {
    return this.request<ApiUsuarioDisciplina>(`/api/usuario-disciplinas/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteUsuarioDisciplina(id: number): Promise<void> {
    return this.request<void>(`/api/usuario-disciplinas/${id}/`, {
      method: "DELETE",
    })
  }

  async getAgendaItens(): Promise<ApiAgendaItem[]> {
    return this.request<ApiAgendaItem[]>("/api/agenda-itens/")
  }

  async createAgendaItem(data: AgendaItemPayload): Promise<ApiAgendaItem> {
    return this.request<ApiAgendaItem>("/api/agenda-itens/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAgendaItem(id: number, data: Partial<AgendaItemPayload>): Promise<ApiAgendaItem> {
    return this.request<ApiAgendaItem>(`/api/agenda-itens/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteAgendaItem(id: number): Promise<void> {
    return this.request<void>(`/api/agenda-itens/${id}/`, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()
