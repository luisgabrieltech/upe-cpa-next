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
import { routes } from "@/lib/routes"
import { getApiUrl } from "@/lib/api-utils"

interface Question {
  id: string
  text: string
  type: "multiple_choice" | "checkbox" | "text" | "scale" | "grid" | "dropdown" | "section"
  required: boolean
  options?: string[]
  rows?: string[]
  columns?: string[]
  conditional?: any
  description?: string
}

interface FormData {
  id: string
  title: string
  description: string
  questions: Question[]
}

function renderConditional(conditional: any, questions: any[]) {
  if (!conditional) return null
  const dependeDe = questions.find(q => q.id === conditional.dependsOn)
  const dependeDeText = dependeDe ? `a resposta da questão "${dependeDe.text}"` : `uma resposta anterior`
  const conds = Array.isArray(conditional.conditions) ? conditional.conditions : []
  const op = conditional.operator === "AND" ? "e" : "ou"
  const condText = conds.map((c: any) => {
    let tipo = c.type === "equals" ? "for igual a" : c.type
    return `${tipo} "${c.value}"`
  }).join(` ${op} `)
  return (
    <div className="mt-2 text-xs text-muted-foreground">
      <b>Condicional:</b> Esta questão só aparece se {dependeDeText} {condText}.
    </div>
  )
}

function shouldShowQuestion(question: any, responses: Record<string, any>): boolean {
  if (!question.conditional) return true;
  const { dependsOn, operator, conditions } = question.conditional;
  const dependentValue = responses[dependsOn];
  if (dependentValue === undefined) return false;
  const checkCondition = (condition: {type: string, value: string}): boolean => {
    if (condition.type === "equals") {
      if (Array.isArray(dependentValue)) {
        return dependentValue.map(String).includes(condition.value);
      }
      return String(dependentValue) === condition.value;
    } else if (condition.type === "contains") {
      if (Array.isArray(dependentValue)) {
        return dependentValue.map(String).some(v => v.includes(condition.value));
      }
      return String(dependentValue).includes(condition.value);
    }
    return false;
  };
  if (operator === "AND") {
    return conditions.every(checkCondition);
  } else {
    return conditions.some(checkCondition);
  }
}

export default function ResponderAvaliacaoPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true)
      const res = await fetch(getApiUrl(`forms?id=${params.id}`))
      if (res.ok) {
        const data = await res.json()
        setFormData(data)
      }
      setLoading(false)
    }
    if (params.id) fetchForm()
  }, [params.id])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      const payload = Object.entries(responses).map(([questionId, value]) => ({
        formId: formData.id,
        questionId,
        value: Array.isArray(value) ? value.join(", ") : String(value ?? "")
      }))
      const res = await fetch(getApiUrl('responses'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload }),
      })
      if (res.ok) {
        toast.success("Avaliação enviada com sucesso!")
        router.push(routes.dashboard.evaluations.home)
      } else {
        toast.error("Erro ao enviar avaliação. Tente novamente.")
      }
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
            <Button variant="ghost" size="icon" onClick={() => router.push(routes.dashboard.evaluations.home)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-upe-blue">{formData.title}</h1>
              <p className="text-muted-foreground">{formData.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {formData.questions.map((question, index) => {
            const type = (question.type || "").toLowerCase();
            if (!shouldShowQuestion(question, responses)) return null;
            const realIndex = formData.questions.slice(0, index).filter((q: any) => (q.type || "").toLowerCase() !== "section").length;
            if (type === "section") {
              const section = question as Question & { description?: string };
              return (
                <div key={section.id} className="py-4 px-2 bg-muted/40 rounded border mb-2">
                  <div className="font-bold text-upe-blue text-lg">{section.text || "(Seção sem título)"}</div>
                  {section.description && (
                    <div className="text-muted-foreground text-sm mt-1">{section.description}</div>
                  )}
                </div>
              );
            }
            return (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <Label className="text-base font-medium text-upe-blue">
                        {realIndex + 1}. {question.text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                    {type === "multiple_choice" && (
                      <RadioGroup
                        onValueChange={(value) => handleResponseChange(question.id, value)}
                        value={responses[question.id]}
                        className="space-y-2"
                      >
                        {Array.isArray(question.options) && question.options.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                            <Label htmlFor={`${question.id}-${option}`} className="text-sm">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {type === "checkbox" && (
                      <div className="space-y-2">
                        {Array.isArray(question.options) && question.options.map((option) => (
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
                    {type === "text" && (
                      <Textarea
                        placeholder="Digite sua resposta aqui..."
                        value={responses[question.id] || ""}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    )}
                    {type === "scale" && (
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
                    {type === "dropdown" && (
                      <Select
                        value={responses[question.id]}
                        onValueChange={(value) => handleResponseChange(question.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(question.options) && question.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {type === "grid" && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 border"></th>
                              {question.columns?.map((column, colIndex) => (
                                <th key={colIndex} className="p-2 border text-center text-sm">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {question.rows?.map((row, rowIndex) => {
                              const rowName = `grid-row-${question.id}-${rowIndex}`;
                              return (
                                <tr key={rowIndex}>
                                  <td className="p-2 border font-medium text-sm">{row}</td>
                                  {question.columns?.map((_, colIndex) => {
                                    const radioValue = `${rowIndex}-${colIndex}`;
                                    const radioId = `grid-${question.id}-${rowIndex}-${colIndex}`;
                                    return (
                                      <td key={colIndex} className="p-2 border text-center">
                                        <input
                                          type="radio"
                                          name={rowName}
                                          value={radioValue}
                                          id={radioId}
                                          checked={responses[question.id]?.[rowIndex] === radioValue}
                                          onChange={() => {
                                            const currentResponses = responses[question.id] || {};
                                            handleResponseChange(question.id, {
                                              ...currentResponses,
                                              [rowIndex]: radioValue
                                            });
                                          }}
                                          className="h-4 w-4 rounded-full border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {question.conditional && renderConditional(question.conditional, formData.questions)}
                  </div>
                </CardContent>
              </Card>
            );
          })}

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