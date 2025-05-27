"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApiUrl } from "@/lib/api-utils"

export default function PreviewFormularioPage() {
  const params = useParams()
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, any>>({})

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full p-4 md:p-6">Carregando...</div>
      </DashboardLayout>
    )
  }

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="w-full p-4 md:p-6">Formulário não encontrado.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <h1 className="text-2xl font-bold text-upe-blue mb-2">Pré-visualização: {formData.title}</h1>
        <p className="text-muted-foreground mb-6">{formData.description}</p>
        <div className="space-y-4">
          {formData.questions.map((question: any, index: number) => {
            const type = (question.type || "").toLowerCase();
            const realIndex = formData.questions.slice(0, index).filter((q: any) => (q.type || "").toLowerCase() !== "section").length;
            if (type === "section") {
              return (
                <div key={question.id} className="py-4 px-2 bg-muted/40 rounded border mb-2">
                  <div className="font-bold text-upe-blue text-lg">{question.text || "(Seção sem título)"}</div>
                  {question.description && <div className="text-muted-foreground text-sm mt-1">{question.description}</div>}
                </div>
              );
            }
            return (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div>
                    <Label className="text-base font-medium text-upe-blue">
                      {realIndex + 1}. {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                  {type === "multiple_choice" && (
                    <RadioGroup value={responses[question.id] || ""} onValueChange={v => handleResponseChange(question.id, v)} className="space-y-2">
                      {Array.isArray(question.options) && question.options.map((option: string) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`} className="text-sm">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {type === "checkbox" && (
                    <div className="space-y-2">
                      {Array.isArray(question.options) && question.options.map((option: string) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            checked={Array.isArray(responses[question.id]) ? responses[question.id].includes(option) : false}
                            onCheckedChange={checked => {
                              const currentValues = Array.isArray(responses[question.id]) ? responses[question.id] : []
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
                    <Textarea value={responses[question.id] || ""} onChange={e => handleResponseChange(question.id, e.target.value)} placeholder="Digite sua resposta aqui..." className="min-h-[100px]" />
                  )}
                  {type === "scale" && (
                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <span className="text-sm text-muted-foreground">1 - Muito insatisfeito</span>
                        <span className="text-sm text-muted-foreground">5 - Muito satisfeito</span>
                      </div>
                      <RadioGroup value={responses[question.id] || ""} onValueChange={v => handleResponseChange(question.id, v)} className="flex justify-between">
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
                    <Select value={responses[question.id] || ""} onValueChange={v => handleResponseChange(question.id, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(question.options) && question.options.map((option: string) => (
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
                            {question.columns?.map((column: string, colIndex: number) => (
                              <th key={colIndex} className="p-2 border text-center text-sm">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {question.rows?.map((row: string, rowIndex: number) => {
                            const rowName = `grid-row-${question.id}-${rowIndex}`;
                            return (
                              <tr key={rowIndex}>
                                <td className="p-2 border font-medium text-sm">{row}</td>
                                {question.columns?.map((_: string, colIndex: number) => {
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  )
} 