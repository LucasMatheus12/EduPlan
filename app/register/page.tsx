"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useUniversidades, useCursos } from "@/hooks/useApiData"
import { ApiTest } from "@/components/ApiTest"
import { GraduationCap, User, Mail, Lock, BookOpen } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    city: "",
    course: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Usar os hooks da API
  const { universidades, loading: universitiesLoading, error: universitiesError } = useUniversidades()
  const { cursos, loading: cursosLoading, error: cursosError } = useCursos()

  console.log("🔍 Register Page - Universidades:", universidades)
  console.log("🔍 Register Page - Cursos:", cursos)
  console.log("🔍 Register Page - Form Data:", formData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("📝 Form submitted with data:", formData)

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (!formData.university || !formData.city || !formData.course) {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("🚀 Calling register function...")

      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword, // Passando confirmPassword
        university: formData.university,
        city: formData.city,
        course: formData.course,
      })

      console.log("📊 Register result:", success)

      if (success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao EduPlan",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Register error:", error)
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Garantir que universidades é um array válido e converter para strings
  const validUniversidades = Array.isArray(universidades) ? universidades : []
  const validCursos = Array.isArray(cursos) ? cursos : []

  // Extrair nomes únicos das universidades - garantindo que são strings
  const uniqueUniversityNames = [...new Set(validUniversidades.map((u) => String(u.nome)).filter(Boolean))]

  // Filtrar cursos baseado na universidade e cidade selecionadas
  const selectedUniversidade = validUniversidades.find(
    (u) => String(u.nome) === formData.university && String(u.polo) === formData.city,
  )

  const availableCourses = selectedUniversidade
    ? validCursos.filter((curso) => {
        // Lidar com universidade como objeto ou ID
        const cursoUnivId = typeof curso.universidade === "object" ? curso.universidade.id : curso.universidade
        return cursoUnivId === selectedUniversidade.id
      })
    : []

  console.log("🎓 Available Courses:", availableCourses)
  console.log("🔍 Filtering logic:", {
    hasUniversity: !!formData.university,
    hasCity: !!formData.city,
    selectedUniversidade,
    totalCursos: validCursos.length,
    filteredCursos: availableCourses.length,
    filterCriteria: {
      university: formData.university,
      city: formData.city,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Componente de teste da API */}
        <ApiTest />

        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta</CardTitle>
            <CardDescription className="text-gray-600">Preencha os dados para criar sua conta</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium">
                  Universidade ({uniqueUniversityNames.length} disponíveis)
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={formData.university}
                    onValueChange={(value) => {
                      console.log("🏫 University selected:", value)
                      setFormData({ ...formData, university: value, city: "", course: "" })
                    }}
                    disabled={universitiesLoading}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue
                        placeholder={
                          universitiesLoading
                            ? "Carregando universidades..."
                            : uniqueUniversityNames.length === 0
                              ? "Nenhuma universidade encontrada"
                              : "Selecione sua universidade"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueUniversityNames.length > 0 ? (
                        uniqueUniversityNames.map((nomeUniversidade) => (
                          <SelectItem key={nomeUniversidade} value={nomeUniversidade}>
                            {nomeUniversidade}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          {universitiesLoading ? "Carregando..." : "Nenhuma universidade encontrada"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {universitiesError && <p className="text-sm text-red-600">{String(universitiesError)}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Cidade/Polo (
                  {formData.university
                    ? validUniversidades.filter((u) => String(u.nome) === formData.university).length
                    : 0}{" "}
                  disponíveis)
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={formData.city}
                    onValueChange={(value) => {
                      console.log("🏙️ City selected:", value)
                      setFormData({ ...formData, city: value, course: "" })
                    }}
                    disabled={universitiesLoading || !formData.university}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue
                        placeholder={
                          !formData.university
                            ? "Selecione uma universidade primeiro"
                            : universitiesLoading
                              ? "Carregando cidades..."
                              : "Selecione sua cidade/polo"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.university ? (
                        validUniversidades
                          .filter((u) => String(u.nome) === formData.university)
                          .map((universidade) => (
                            <SelectItem
                              key={`${universidade.id}-${universidade.polo}`}
                              value={String(universidade.polo)}
                            >
                              {String(universidade.polo)}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          Selecione uma universidade primeiro
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="text-sm font-medium">
                  Curso de Graduação ({availableCourses.length} disponíveis)
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={formData.course}
                    onValueChange={(value) => {
                      console.log("🎓 Course selected:", value)
                      setFormData({ ...formData, course: value })
                    }}
                    disabled={cursosLoading || !formData.university || !formData.city}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue
                        placeholder={
                          !formData.university || !formData.city
                            ? "Selecione universidade e cidade primeiro"
                            : cursosLoading
                              ? "Carregando cursos..."
                              : availableCourses.length === 0
                                ? "Nenhum curso encontrado para esta combinação"
                                : "Selecione seu curso"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.length > 0 ? (
                        availableCourses.map((curso) => (
                          <SelectItem key={curso.id} value={String(curso.nome)}>
                            {String(curso.nome)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          {!formData.university || !formData.city
                            ? "Selecione universidade e cidade primeiro"
                            : cursosLoading
                              ? "Carregando..."
                              : "Nenhum curso encontrado para esta combinação"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {cursosError && <p className="text-sm text-red-600">{String(cursosError)}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || universitiesLoading || cursosLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/" className="text-green-600 hover:text-green-800 font-medium">
                  Fazer Login
                </Link>
              </div>
            </CardFooter>
          </form>

          {/* Debug info - remova em produção */}
          <div className="p-4 bg-gray-100 text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Universidades: {validUniversidades.length}</p>
            <p>Cursos: {validCursos.length}</p>
            <p>Universidade selecionada: {formData.university || "Nenhuma"}</p>
            <p>Cidade selecionada: {formData.city || "Nenhuma"}</p>
            <p>Universidade encontrada: {selectedUniversidade ? `ID ${selectedUniversidade.id}` : "Não"}</p>
            <p>Cursos disponíveis: {availableCourses.length}</p>
            <p>
              Loading: Unis={String(universitiesLoading)}, Cursos={String(cursosLoading)}
            </p>
            <p>Password: {formData.password ? "✓" : "✗"}</p>
            <p>Confirm Password: {formData.confirmPassword ? "✓" : "✗"}</p>
            <p>Passwords Match: {formData.password === formData.confirmPassword ? "✓" : "✗"}</p>
            {availableCourses.length > 0 && (
              <div>
                <p>
                  <strong>Cursos encontrados:</strong>
                </p>
                {availableCourses.map((curso) => (
                  <p key={curso.id}>
                    - {String(curso.nome)} (ID: {curso.id}, Univ ID:{" "}
                    {typeof curso.universidade === "object" ? curso.universidade.id : curso.universidade})
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
