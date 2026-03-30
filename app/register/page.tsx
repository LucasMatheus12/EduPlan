"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useUniversidades, useCursos } from "@/hooks/useApiData"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Lock,
  Mail,
  School,
  Sparkles,
  User,
} from "lucide-react"

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAKHXjfJ_zxWjJSFMea1kSMb426COLrH5nfM9DKr6Y4mdGfhlEetOBe01VnZosTAl1Euh8gIg3nCMsMzSX7h61l7YoZLPc6qdiv4OFwiRPB3pjuVjokSU07PHGblH5e7pMT1gQ9zls2IWmGP5DlQi5LqJTG4yl0QOxOnPngjmQ8YREeWFztq97aBQ6AgaGnMFEXqFn32nu8KHBLGbnYyyeI3UmPwZaRPa0-mlrasfqIOCqCO96G4OgAog2MBPwG2aAMLzIn7secDTqW"

const inputClassName =
  "block w-full rounded-edu border-none bg-edu-highest py-4 pl-11 pr-4 font-medium text-edu-ink placeholder:text-edu-outline transition-all focus:bg-edu-lowest focus:ring-2 focus:ring-edu-primary/30"

const selectTriggerClassName =
  "h-auto min-h-[3.25rem] w-full rounded-edu border-none bg-edu-highest py-4 pl-11 pr-10 text-left font-medium text-edu-ink focus:ring-2 focus:ring-edu-primary/30 focus:ring-offset-0 [&>span]:line-clamp-1"

const STEP_COPY = [
  {
    title: "Seus dados",
    description: "Como devemos te chamar e onde enviar avisos.",
  },
  {
    title: "Sua formação",
    description: "Universidade, polo e curso para personalizar o planejamento.",
  },
  {
    title: "Segurança",
    description: "Defina uma senha para proteger sua conta.",
  },
] as const

const TOTAL_STEPS = STEP_COPY.length

export default function RegisterPage() {
  const [step, setStep] = useState(0)
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

  const { universidades, loading: universitiesLoading, error: universitiesError } = useUniversidades()
  const { cursos, loading: cursosLoading, error: cursosError } = useCursos()

  const validUniversidades = Array.isArray(universidades) ? universidades : []
  const validCursos = Array.isArray(cursos) ? cursos : []

  const uniqueUniversityNames = [...new Set(validUniversidades.map((u) => String(u.nome)).filter(Boolean))]

  const selectedUniversidade = validUniversidades.find(
    (u) => String(u.nome) === formData.university && String(u.polo) === formData.city,
  )

  const availableCourses = selectedUniversidade
    ? validCursos.filter((curso) => {
        const cursoUnivId = typeof curso.universidade === "object" ? curso.universidade.id : curso.universidade
        return cursoUnivId === selectedUniversidade.id
      })
    : []

  const emailLooksValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      if (!formData.name.trim()) {
        toast({ title: "Campo obrigatório", description: "Informe seu nome completo.", variant: "destructive" })
        return false
      }
      if (!emailLooksValid(formData.email)) {
        toast({ title: "E-mail inválido", description: "Digite um e-mail válido.", variant: "destructive" })
        return false
      }
      return true
    }
    if (s === 1) {
      if (!formData.university || !formData.city || !formData.course) {
        toast({
          title: "Formação incompleta",
          description: "Selecione universidade, polo e curso.",
          variant: "destructive",
        })
        return false
      }
      return true
    }
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep((x) => Math.min(x + 1, TOTAL_STEPS - 1))
  }

  const goBack = () => {
    setStep((x) => Math.max(x - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step < TOTAL_STEPS - 1) {
      goNext()
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha curta",
        description: "Use pelo menos 6 caracteres.",
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
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        university: formData.university,
        city: formData.city,
        course: formData.course,
      })

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
    } catch {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stepInfo = STEP_COPY[step]
  const isLastStep = step === TOTAL_STEPS - 1
  const blockActions = isLoading || universitiesLoading || cursosLoading

  return (
    <main className="flex min-h-screen overflow-hidden bg-edu-surface font-sans text-edu-ink selection:bg-[#dbe1ff] selection:text-edu-primary">
      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-edu-primary p-12 lg:flex xl:w-7/12">
        <div className="bg-academic-gradient absolute inset-0 z-10 opacity-90" aria-hidden />
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          src={HERO_IMAGE}
        />
        <div className="relative z-20 w-full max-w-2xl">
          <div className="mb-16">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                <School className="h-7 w-7 text-edu-primary" strokeWidth={2} />
              </div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">EduPlan</h1>
            </div>
            <h2 className="font-headline text-5xl font-black leading-tight tracking-tight text-white xl:text-6xl">
              Comece sua jornada <br />
              <span className="text-edu-secondary-tint">no planejamento acadêmico.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card-edu rounded-edu border border-white/10 p-6">
              <Sparkles className="mb-4 block h-7 w-7 text-white" strokeWidth={1.75} />
              <h3 className="mb-1 font-bold text-white">Perfil completo</h3>
              <p className="text-sm text-white/70">Universidade, polo e curso alinhados à sua realidade.</p>
            </div>
            <div className="glass-card-edu rounded-edu border border-white/10 p-6">
              <BadgeCheck className="mb-4 block h-7 w-7 text-white" strokeWidth={1.75} />
              <h3 className="mb-1 font-bold text-white">Conta segura</h3>
              <p className="text-sm text-white/70">Acesso personalizado ao seu painel e grade curricular.</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 z-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" aria-hidden />
      </section>

      <section className="relative flex w-full flex-1 flex-col overflow-y-auto bg-edu-lowest p-8 md:p-16 xl:w-5/12 xl:p-24 lg:w-1/2">
        <div className="mx-auto w-full max-w-md flex-1 py-4">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <School className="h-8 w-8 text-edu-primary" strokeWidth={2} />
            <span className="font-headline text-2xl font-black text-edu-primary">EduPlan</span>
          </div>

          <div className="mb-8" role="navigation" aria-label="Progresso do cadastro">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-edu-outline">
              <span>
                Passo {step + 1} de {TOTAL_STEPS}
              </span>
              <span className="normal-case text-edu-ink-muted">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-edu-primary" : "bg-edu-high"
                  }`}
                />
              ))}
            </div>
          </div>

          <header className="mb-8">
            <h2 className="font-headline mb-2 text-3xl font-extrabold text-edu-ink">{stepInfo.title}</h2>
            <p className="font-medium text-edu-ink-muted">{stepInfo.description}</p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    Nome completo
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    E-mail
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nome@universidade.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="university" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    Universidade
                    <span className="ml-1 font-normal text-edu-outline">({uniqueUniversityNames.length})</span>
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                      <BookOpen className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => setFormData({ ...formData, university: value, city: "", course: "" })}
                      disabled={universitiesLoading}
                    >
                      <SelectTrigger id="university" className={selectTriggerClassName}>
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
                      <SelectContent className="rounded-edu border-edu-outline-soft bg-edu-lowest">
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
                  <Label htmlFor="city" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    Cidade / polo
                    <span className="ml-1 font-normal text-edu-outline">
                      (
                      {formData.university
                        ? validUniversidades.filter((u) => String(u.nome) === formData.university).length
                        : 0}
                      )
                    </span>
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                      <BookOpen className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value, course: "" })}
                      disabled={universitiesLoading || !formData.university}
                    >
                      <SelectTrigger id="city" className={selectTriggerClassName}>
                        <SelectValue
                          placeholder={
                            !formData.university
                              ? "Selecione uma universidade primeiro"
                              : universitiesLoading
                                ? "Carregando cidades..."
                                : "Selecione sua cidade ou polo"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-edu border-edu-outline-soft bg-edu-lowest">
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
                  <Label htmlFor="course" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    Curso de graduação
                    <span className="ml-1 font-normal text-edu-outline">({availableCourses.length})</span>
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                      <BookOpen className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <Select
                      value={formData.course}
                      onValueChange={(value) => setFormData({ ...formData, course: value })}
                      disabled={cursosLoading || !formData.university || !formData.city}
                    >
                      <SelectTrigger id="course" className={selectTriggerClassName}>
                        <SelectValue
                          placeholder={
                            !formData.university || !formData.city
                              ? "Selecione universidade e polo primeiro"
                              : cursosLoading
                                ? "Carregando cursos..."
                                : availableCourses.length === 0
                                  ? "Nenhum curso para esta combinação"
                                  : "Selecione seu curso"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-edu border-edu-outline-soft bg-edu-lowest">
                        {availableCourses.length > 0 ? (
                          availableCourses.map((curso) => (
                            <SelectItem key={curso.id} value={String(curso.nome)}>
                              {String(curso.nome)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            {!formData.university || !formData.city
                              ? "Selecione universidade e polo primeiro"
                              : cursosLoading
                                ? "Carregando..."
                                : "Nenhum curso para esta combinação"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {cursosError && <p className="text-sm text-red-600">{String(cursosError)}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    Senha
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="ml-1 text-sm font-semibold text-edu-ink-muted">
                    Confirmar senha
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repita a senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={blockActions}
                  className="order-2 flex items-center justify-center gap-2 rounded-full border border-edu-outline-soft bg-transparent py-3.5 px-5 font-headline text-sm font-bold text-edu-ink-muted transition-colors hover:bg-edu-low disabled:opacity-50 sm:order-1 sm:justify-start"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
              ) : (
                <span className="hidden sm:block sm:w-[7.5rem]" aria-hidden />
              )}

              <button
                type="submit"
                disabled={blockActions}
                className={`order-1 flex w-full items-center justify-center gap-2 rounded-full bg-academic-gradient py-4 px-6 font-headline text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-70 sm:order-2 sm:ml-auto sm:w-auto sm:min-w-[200px] ${isLastStep ? "group" : ""}`}
              >
                {isLastStep ? (
                  <>
                    {isLoading ? "Criando conta..." : "Criar conta"}
                    {!isLoading && (
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    )}
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-12 pb-8 text-center">
            <p className="font-medium text-edu-ink-muted">
              Já tem uma conta?{" "}
              <Link href="/" className="ml-1 font-bold text-edu-primary underline-offset-4 hover:underline">
                Fazer login
              </Link>
            </p>
          </footer>
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-between px-1 pb-6 text-[10px] font-bold uppercase tracking-widest text-edu-outline opacity-50">
          <span>EduPlan Acadêmico</span>
          <span>Privacidade e termos</span>
        </div>
      </section>
    </main>
  )
}
