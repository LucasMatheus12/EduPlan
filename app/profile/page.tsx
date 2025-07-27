"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/Navigation"
import { User, Mail, BookOpen, Edit, Save, X } from "lucide-react"
import { useUniversidades, useCursos } from "@/hooks/useApiData"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Usar apenas dados da API
  const { universidades, loading: universitiesLoading } = useUniversidades()
  const { cursos, loading: cursosLoading } = useCursos()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    city: "",
    course: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    setFormData({
      name: user.name,
      email: user.email,
      university: user.university,
      city: user.city,
      course: user.course,
    })
  }, [user, router])

  const handleSave = async () => {
    try {
      await updateUser(formData)
      setIsEditing(false)
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao salvar suas informações",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        university: user.university,
        city: user.city,
        course: user.course,
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Garantir que universidades é um array válido e converter para strings
  const validUniversidades = Array.isArray(universidades) ? universidades : []
  const validCursos = Array.isArray(cursos) ? cursos : []

  // Extrair polos únicos das universidades da API (mudado de cidade para polo)
  const cities = [...new Set(validUniversidades.map((u) => String(u.polo)))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 bg-blue-600">
                  <AvatarFallback className="text-white text-xl font-bold">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold text-gray-900">Meu Perfil</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-lg"
                    />
                  ) : (
                    <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-md">{user.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-lg"
                    />
                  ) : (
                    <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-md">{user.email}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Universidade
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.university}
                      onValueChange={(value) => setFormData({ ...formData, university: value })}
                      disabled={universitiesLoading}
                    >
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Selecione uma universidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {validUniversidades.map((universidade) => (
                          <SelectItem key={universidade.id} value={String(universidade.nome)}>
                            {String(universidade.nome)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-md">{user.university}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Cidade/Polo
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      disabled={universitiesLoading}
                    >
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Selecione uma cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((cidade) => (
                          <SelectItem key={cidade} value={cidade}>
                            {cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-md">{user.city}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Curso de Graduação
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.course}
                      onValueChange={(value) => setFormData({ ...formData, course: value })}
                      disabled={cursosLoading}
                    >
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {validCursos.map((curso) => (
                          <SelectItem key={curso.id} value={String(curso.nome)}>
                            {String(curso.nome)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-md">{user.course}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
