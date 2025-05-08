"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Question {
  id: string
  text: string
  type: "multiple_choice" | "checkbox" | "text" | "scale" | "grid" | "dropdown"
  required: boolean
  options?: string[]
  rows?: string[]
  columns?: string[]
}

interface FormData {
  id: string
  title: string
  description: string
  questions: Question[]
}

export default function ResponderAvaliacaoPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implementar a busca do formulário pelo ID
    // Por enquanto, usando dados mockados
    setFormData({
      id: params.id as string,
      title: "Avaliação Institucional 2023.2",
      description: "Avaliação geral da instituição para o semestre 2023.2",
      questions: [
        {
          id: "1",
          text: "Como você avalia a infraestrutura geral da instituição?",
          type: "scale",
          required: true
        },
        {
          id: "2",
          text: "Quais serviços você utiliza com mais frequência?",
          type: "checkbox",
          required: true,
          options: ["Biblioteca", "Laboratórios", "Restaurante Universitário", "Centro de Informática"]
        },
        {
          id: "3",
          text: "Descreva os principais pontos positivos da instituição:",
          type: "text",
          required: true
        }
      ]
    })
    setLoading(false)
  }, [params.id])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      // TODO: Implementar o envio das respostas para o backend
      console.log("Respostas:", responses)
      toast.success("Avaliação enviada com sucesso!")
      router.push("/dashboard/avaliacoes")
    } catch (error) {
      toast.error("Erro ao enviar avaliação. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full p-4 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-4 w-1/4 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="w-full p-4 md:p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Formulário não encontrado</h2>
            <p className="text-muted-foreground">O formulário solicitado não existe ou não está mais disponível.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/avaliacoes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-upe-blue">{formData.title}</h1>
              <p className="text-muted-foreground">{formData.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {formData.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label className="text-base font-medium text-upe-blue">
                      {index + 1}. {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>

                  {question.type === "multiple_choice" && (
                    <RadioGroup
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                      value={responses[question.id]}
                      className="space-y-2"
                    >
                      {question.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`} className="text-sm">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "checkbox" && (
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            checked={responses[question.id]?.includes(option)}
                            onCheckedChange={(checked) => {
                              const currentValues = responses[question.id] || []
                              handleResponseChange(
                                question.id,
                                checked
                                  ? [...currentValues, option]
                                  : currentValues.filter((v: string) => v !== option)
                              )
                            }}
                          />
                          <Label htmlFor={`${question.id}-${option}`} className="text-sm">{option}</Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "text" && (
                    <Textarea
                      placeholder="Digite sua resposta aqui..."
                      value={responses[question.id] || ""}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="min-h-[100px]"
                    />
                  )}

                  {question.type === "scale" && (
                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <span className="text-sm text-muted-foreground">1 - Muito insatisfeito</span>
                        <span className="text-sm text-muted-foreground">5 - Muito satisfeito</span>
                      </div>
                      <RadioGroup
                        value={responses[question.id]}
                        onValueChange={(value) => handleResponseChange(question.id, value)}
                        className="flex justify-between"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num} className="flex flex-col items-center gap-2">
                            <RadioGroupItem value={String(num)} id={`scale-${question.id}-${num}`} />
                            <Label htmlFor={`scale-${question.id}-${num}`} className="text-sm">
                              {num}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {question.type === "dropdown" && (
                    <Select
                      value={responses[question.id]}
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              className="bg-upe-blue hover:bg-upe-blue/90 text-white"
              onClick={handleSubmit}
            >
              <Save className="mr-2 h-4 w-4" />
              Enviar Avaliação
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 