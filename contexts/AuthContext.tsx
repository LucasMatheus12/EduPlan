"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  university: string
  city: string
  course: string
  completedSubjects: string[]
  schedule: { [key: string]: string }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "completedSubjects" | "schedule">) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  toggleSubject: (subjectId: string) => void
  updateSchedule: (day: string, time: string, subject: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    university: "Universidade Federal do Exemplo",
    city: "Natal",
    course: "Engenharia Civil",
    completedSubjects: [],
    schedule: {},
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
  }, [user])

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      return true
    }

    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const registeredUser = registeredUsers.find((u: User) => u.email === email)

    if (registeredUser) {
      setUser(registeredUser)
      return true
    }

    return false
  }

  const register = async (userData: Omit<User, "id" | "completedSubjects" | "schedule">): Promise<boolean> => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      completedSubjects: [],
      schedule: {},
    }

    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    registeredUsers.push(newUser)
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

    setUser(newUser)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)

      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const userIndex = registeredUsers.findIndex((u: User) => u.id === user.id)
      if (userIndex !== -1) {
        registeredUsers[userIndex] = updatedUser
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
      }
    }
  }

  const toggleSubject = (subjectId: string) => {
    if (user) {
      const completedSubjects = user.completedSubjects.includes(subjectId)
        ? user.completedSubjects.filter((id) => id !== subjectId)
        : [...user.completedSubjects, subjectId]

      updateUser({ completedSubjects })
    }
  }

  const updateSchedule = (day: string, time: string, subject: string) => {
    if (user) {
      const scheduleKey = `${day}-${time}`
      const newSchedule = { ...user.schedule }

      if (subject.trim()) {
        newSchedule[scheduleKey] = subject
      } else {
        delete newSchedule[scheduleKey]
      }

      updateUser({ schedule: newSchedule })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        toggleSubject,
        updateSchedule,
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
