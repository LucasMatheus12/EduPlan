"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  School,
  Sparkles,
} from "lucide-react"

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAKHXjfJ_zxWjJSFMea1kSMb426COLrH5nfM9DKr6Y4mdGfhlEetOBe01VnZosTAl1Euh8gIg3nCMsMzSX7h61l7YoZLPc6qdiv4OFwiRPB3pjuVjokSU07PHGblH5e7pMT1gQ9zls2IWmGP5DlQi5LqJTG4yl0QOxOnPngjmQ8YREeWFztq97aBQ6AgaGnMFEXqFn32nu8KHBLGbnYyyeI3UmPwZaRPa0-mlrasfqIOCqCO96G4OgAog2MBPwG2aAMLzIn7secDTqW"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao EduPlan",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Erro no login",
          description: "E-mail ou senha incorretos",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-edu-surface font-sans text-edu-ink selection:bg-[#dbe1ff] selection:text-edu-primary">
      {/* Painel esquerdo — marca e destaque */}
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
              Arquitetando o <br />
              <span className="text-edu-secondary-tint">futuro da aprendizagem.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card-edu rounded-edu border border-white/10 p-6">
              <Sparkles className="mb-4 block h-7 w-7 text-white" strokeWidth={1.75} />
              <h3 className="mb-1 font-bold text-white">Currículo inteligente</h3>
              <p className="text-sm text-white/70">
                Planejamento do seu percurso acadêmico com foco e clareza.
              </p>
            </div>
            <div className="glass-card-edu rounded-edu border border-white/10 p-6">
              <BadgeCheck className="mb-4 block h-7 w-7 text-white" strokeWidth={1.75} />
              <h3 className="mb-1 font-bold text-white">Acompanhamento de formação</h3>
              <p className="text-sm text-white/70">
                Controle em tempo real de disciplinas e requisitos do curso.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 z-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" aria-hidden />
      </section>

      {/* Formulário */}
      <section className="relative flex w-full items-center justify-center bg-edu-lowest p-8 md:p-16 xl:w-5/12 xl:p-24 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-2 lg:hidden">
            <School className="h-8 w-8 text-edu-primary" strokeWidth={2} />
            <span className="font-headline text-2xl font-black text-edu-primary">EduPlan</span>
          </div>

          <header className="mb-10">
            <h2 className="font-headline mb-2 text-3xl font-extrabold text-edu-ink">Bem-vindo de volta</h2>
            <p className="font-medium text-edu-ink-muted">Continue sua jornada acadêmica com o EduPlan.</p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="ml-1 block text-sm font-semibold text-edu-ink-muted" htmlFor="email">
                E-mail
              </label>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-edu border-none bg-edu-highest py-4 pl-11 pr-4 font-medium text-edu-ink placeholder:text-edu-outline transition-all focus:bg-edu-lowest focus:ring-2 focus:ring-edu-primary/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="ml-1 flex items-center justify-between">
                <label className="block text-sm font-semibold text-edu-ink-muted" htmlFor="password">
                  Senha
                </label>
                <span className="cursor-not-allowed text-xs font-bold text-edu-primary opacity-70">
                  Esqueceu a senha?
                </span>
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-edu-outline transition-colors group-focus-within:text-edu-primary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-edu border-none bg-edu-highest py-4 pl-11 pr-12 font-medium text-edu-ink placeholder:text-edu-outline transition-all focus:bg-edu-lowest focus:ring-2 focus:ring-edu-primary/30"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-edu-outline hover:text-edu-ink-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center px-1">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-5 w-5 rounded border-edu-outline-soft bg-edu-highest text-edu-primary focus:ring-edu-primary/30"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-edu-ink-muted">
                Manter-me conectado
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-academic-gradient py-4 px-6 font-headline text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-70"
            >
              {isLoading ? "Entrando..." : "Entrar"}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="font-medium text-edu-ink-muted">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="ml-1 font-bold text-edu-primary underline-offset-4 hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </footer>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-edu-outline opacity-50">
          <span>EduPlan Acadêmico</span>
          <span>Privacidade e termos</span>
        </div>
      </section>
    </main>
  )
}
