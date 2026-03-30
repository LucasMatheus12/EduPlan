"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react"

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const navLinkClass = (active: boolean) =>
  cn(
    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
    active
      ? "bg-blue-600/10 text-blue-700 shadow-sm ring-1 ring-blue-600/15"
      : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900",
  )

export function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const isDashboard = pathname === "/dashboard"
  const isProfile = pathname === "/profile"
  const isSchedule = pathname === "/schedule"

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

      <nav className="mx-auto flex h-[4.25rem] w-full max-w-[min(100%,100rem)] items-center justify-between gap-4 px-3 sm:px-5 lg:px-6">
        <Link
          href={user ? "/dashboard" : "/"}
          className="group flex shrink-0 items-center gap-3 rounded-2xl pr-2 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 transition-transform group-hover:scale-[1.03]">
            <GraduationCap className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="font-headline hidden text-lg font-extrabold tracking-tight text-slate-900 sm:block">
            EduPlan
          </span>
        </Link>

        {user ? (
          <>
            <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
              <Link href="/dashboard" className={navLinkClass(isDashboard)}>
                <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                Início
              </Link>
              <Link href="/schedule" className={navLinkClass(isSchedule)}>
                <CalendarDays className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                Agenda
              </Link>
              <Link href="/profile" className={navLinkClass(isProfile)}>
                <UserRound className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                Perfil
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-11 gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-2 pr-3 shadow-sm hover:bg-slate-50"
                  >
                    <Avatar className="h-9 w-9 border border-slate-200/80 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[10rem] truncate text-left text-sm font-semibold text-slate-800 lg:block">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-2xl border-slate-200/80 p-2 shadow-xl">
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col gap-0.5 md:hidden">
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Início
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/schedule" className="cursor-pointer">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Agenda
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/profile" className="cursor-pointer">
                        <UserRound className="mr-2 h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-xl font-semibold text-slate-700" asChild>
              <Link href="/">Entrar</Link>
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700"
              asChild
            >
              <Link href="/register">Criar conta</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  )
}
