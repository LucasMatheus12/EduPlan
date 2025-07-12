"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/Navigation"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Save } from "lucide-react"

const timeSlots = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
]

const weekDays = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
]

export default function SchedulePage() {
  const { user, updateSchedule } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [localSchedule, setLocalSchedule] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    setLocalSchedule(user.schedule || {})
  }, [user, router])

  if (!user) {
    return null
  }

  const handleScheduleChange = (day: string, time: string, value: string) => {
    const key = `${day}-${time}`
    setLocalSchedule((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    Object.entries(localSchedule).forEach(([key, value]) => {
      const [day, time] = key.split("-")
      updateSchedule(day, time, value)
    })

    toast({
      title: "Horários salvos",
      description: "Sua grade de horários foi atualizada com sucesso",
    })
  }

  const getScheduleValue = (day: string, time: string) => {
    const key = `${day}-${time}`
    return localSchedule[key] || ""
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Grade de Horários
            </h1>
            <p className="text-gray-600">Organize seus horários de aula da semana</p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Horários
          </Button>
        </div>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Grade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left font-semibold text-gray-900 min-w-[100px]">Horário</th>
                    {weekDays.map((day) => (
                      <th key={day.key} className="p-4 text-center font-semibold text-gray-900 min-w-[150px]">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">{time}</td>
                      {weekDays.map((day) => (
                        <td key={`${day.key}-${time}`} className="p-2">
                          <Input
                            value={getScheduleValue(day.key, time)}
                            onChange={(e) => handleScheduleChange(day.key, time, e.target.value)}
                            placeholder="Disciplina"
                            className="text-center text-sm border-gray-200 focus:border-blue-400"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Dicas:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Clique em qualquer célula para adicionar ou editar uma disciplina</li>
            <li>• Deixe em branco os horários livres</li>
            <li>• Use nomes curtos para as disciplinas (ex: "Cálculo I", "Prog Web")</li>
            <li>• Não esqueça de clicar em "Salvar Horários" após fazer alterações</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
