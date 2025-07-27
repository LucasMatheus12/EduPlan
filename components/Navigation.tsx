"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export const Navigation = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center text-gray-900 font-semibold text-xl">
              <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
              EduPlan
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                Meu Perfil
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <div>
              <Link href="/" className="text-gray-700 hover:text-blue-600 mr-4">
                Login
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-blue-600">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
