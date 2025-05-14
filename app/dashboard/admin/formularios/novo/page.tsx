"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Trash2, Save, Calendar, Clock, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import React from "react"

interface Question {
  id: string
  type: "multiple_choice" | "checkbox" | "text" | "scale" | "grid" | "dropdown"
  text: string
  required: boolean
  options: string[]
  rows?: string[]
  columns?: string[]
  conditional?: {
    dependsOn: string
    operator: "OR" | "AND"
    conditions: Array<{
      type: "equals" | "contains"
      value: string
    }>
  }
}

interface FormData {
  title: string
  description: string
  category: string
  status: string
  endDate: Date | null
  estimatedTime: string
  questions: Question[]
}

interface NovoFormularioPageProps {
  initialData?: any
}

function normalizeQuestion(q: any): Question {
  return {
    id: q.id,
    type: (q.type || "text").toLowerCase(),
    text: q.text || "",
    required: q.required ?? true,
    options: Array.isArray(q.options) ? q.options : [],
    rows: Array.isArray(q.rows) ? q.rows : [],
    columns: Array.isArray(q.columns) ? q.columns : [],
    conditional: q.conditional
      ? {
          dependsOn: q.conditional.dependsOn || "",
          operator: q.conditional.operator || "OR",
          conditions: Array.isArray(q.conditional.conditions)
            ? q.conditional.conditions.map((c: any) => ({
                type: c.type || "equals",
                value: String(c.value ?? "")
              }))
            : [],
        }
      : undefined,
  }
}

export default function NovoFormularioPage({ initialData }: NovoFormularioPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState(() => initialData ? {
    title: initialData.title || "",
    description: initialData.description || "",
    category: initialData.category || "",
    startDate: initialData.startDate ? new Date(initialData.startDate) : null,
    endDate: initialData.deadline ? new Date(initialData.deadline) : null,
    estimatedTime: initialData.estimatedTime || "",
    status: initialData.status || "ACTIVE",
    questions: Array.isArray(initialData.questions)
      ? initialData.questions.map(normalizeQuestion)
      : [],
  } : {
    title: "",
    description: "",
    category: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    estimatedTime: "",
    status: "ACTIVE",
    questions: [] as Question[],
  })
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    type: "multiple_choice",
    text: "",
    required: true,
    options: ["", ""],
    rows: [],
    columns: [],
  })
  
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  const [responses, setResponses] = useState<Record<string, any>>({})
  
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditional) return true;
    
    const { dependsOn, operator, conditions } = question.conditional;
    const dependentValue = responses[dependsOn];
    
    if (dependentValue === undefined) return false;
    
    const checkCondition = (condition: {type: "equals" | "contains", value: string}): boolean => {
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
  };
  
  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    const reorderedQuestions = Array.from(formData.questions);
    const temp = reorderedQuestions[index];
    reorderedQuestions[index] = reorderedQuestions[index - 1];
    reorderedQuestions[index - 1] = temp;
    
    setFormData({
      ...formData,
      questions: reorderedQuestions
    });
  };

  const moveQuestionDown = (index: number) => {
    if (index === formData.questions.length - 1) return;
    const reorderedQuestions = Array.from(formData.questions);
    const temp = reorderedQuestions[index];
    reorderedQuestions[index] = reorderedQuestions[index + 1];
    reorderedQuestions[index + 1] = temp;
    
    setFormData({
      ...formData,
      questions: reorderedQuestions
    });
  };

  const editQuestion = (questionId: string) => {
    const questionToEdit = formData.questions.find(q => q.id === questionId);
    if (questionToEdit) {
      setCurrentQuestion({...questionToEdit});
      setEditingQuestionId(questionId);
    }
  };
  
  const cancelEditing = () => {
    setEditingQuestionId(null);
    setCurrentQuestion({
      id: "",
      type: "multiple_choice",
      text: "",
      required: true,
      options: ["", ""],
      rows: [],
      columns: [],
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      return
    }

    if (editingQuestionId) {
      const updatedQuestions = formData.questions.map(q =>
        q.id === editingQuestionId ? { ...currentQuestion, id: editingQuestionId } : q
      );
      setFormData({
        ...formData,
        questions: updatedQuestions,
      });
      setEditingQuestionId(null);
    } else {
      const newQuestion = {
        ...currentQuestion,
        id: currentQuestion.id && currentQuestion.id.trim() !== "" ? currentQuestion.id : `question-${Date.now()}`,
      }
      setFormData({
        ...formData,
        questions: [...formData.questions, newQuestion],
      });
    }

    setCurrentQuestion({
      id: "",
      type: "multiple_choice",
      text: "",
      required: true,
      options: ["", ""],
      rows: [],
      columns: [],
    });
  }

  const removeQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== questionId),
    })
  }

  const addOption = () => {
    if (currentQuestion.options.length < 10) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, ""],
      })
    }
  }

  const removeOption = (index: number) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = [...currentQuestion.options]
      newOptions.splice(index, 1)
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    })
  }

  const addRow = () => {
    if (currentQuestion.rows && currentQuestion.rows.length < 10) {
      setCurrentQuestion({
        ...currentQuestion,
        rows: [...currentQuestion.rows, ""],
      });
    }
  }

  const removeRow = (index: number) => {
    if (currentQuestion.rows && currentQuestion.rows.length > 2) {
      const newRows = [...currentQuestion.rows];
      newRows.splice(index, 1);
      setCurrentQuestion({
        ...currentQuestion,
        rows: newRows,
      });
    }
  }

  const updateRow = (index: number, value: string) => {
    if (currentQuestion.rows) {
      const newRows = [...currentQuestion.rows];
      newRows[index] = value;
      setCurrentQuestion({
        ...currentQuestion,
        rows: newRows,
      });
    }
  }

  const addColumn = () => {
    if (currentQuestion.columns && currentQuestion.columns.length < 10) {
      setCurrentQuestion({
        ...currentQuestion,
        columns: [...currentQuestion.columns, ""],
      });
    }
  }

  const removeColumn = (index: number) => {
    if (currentQuestion.columns && currentQuestion.columns.length > 2) {
      const newColumns = [...currentQuestion.columns];
      newColumns.splice(index, 1);
      setCurrentQuestion({
        ...currentQuestion,
        columns: newColumns,
      });
    }
  }

  const updateColumn = (index: number, value: string) => {
    if (currentQuestion.columns) {
      const newColumns = [...currentQuestion.columns];
      newColumns[index] = value;
      setCurrentQuestion({
        ...currentQuestion,
        columns: newColumns,
      });
    }
  }

  const addCondition = () => {
    if (currentQuestion.conditional) {
      setCurrentQuestion({
        ...currentQuestion,
        conditional: {
          ...currentQuestion.conditional,
          conditions: [
            ...currentQuestion.conditional.conditions,
            { type: "equals", value: "" }
          ]
        }
      });
    }
  };
  
  const removeCondition = (index: number) => {
    if (currentQuestion.conditional && currentQuestion.conditional.conditions.length > 1) {
      const newConditions = [...currentQuestion.conditional.conditions];
      newConditions.splice(index, 1);
      setCurrentQuestion({
        ...currentQuestion,
        conditional: {
          ...currentQuestion.conditional,
          conditions: newConditions
        }
      });
    }
  };
  
  const updateCondition = (index: number, field: "type" | "value", value: string) => {
    if (currentQuestion.conditional) {
      const newConditions = [...currentQuestion.conditional.conditions];
      newConditions[index] = {
        ...newConditions[index],
        [field]: field === "type" 
          ? (value as "equals" | "contains") 
          : value
      };
      
      setCurrentQuestion({
        ...currentQuestion,
        conditional: {
          ...currentQuestion.conditional,
          conditions: newConditions
        }
      });
    }
  };

  const saveForm = async () => {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: initialData?.id,
          title: formData.title,
          description: formData.description,
          category: formData.category?.toUpperCase(),
          status: formData.status,
          deadline: formData.endDate,
          estimatedTime: formData.estimatedTime,
          questions: formData.questions.map((q: Question) => ({
            id: q.id,
            text: q.text,
            type: q.type
              .replace("multiple_choice", "MULTIPLE_CHOICE")
              .replace("checkbox", "CHECKBOX")
              .replace("text", "TEXT")
              .replace("scale", "SCALE")
              .replace("grid", "GRID")
              .replace("dropdown", "DROPDOWN"),
            required: q.required,
            options: q.options || [],
            rows: q.rows || [],
            columns: q.columns || [],
            conditional: q.conditional || null,
          })),
        }),
      })
      if (res.ok) {
        router.push("/dashboard/admin/formularios")
      } else {
        alert("Erro ao salvar formulário")
      }
    } catch (error) {
      alert("Erro ao salvar formulário")
    }
  }

  const QuestionsList = React.memo(() => {
    return (
      <div className="space-y-4">
        {formData.questions.map((question, index) => (
          <div 
            key={question.id}
            className="flex items-start gap-2 p-4 border rounded-md"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {index + 1}. {question.text}
                    {question.id && (
                      <span className="ml-2 text-xs text-muted-foreground">[{question.id}]</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {question.type === "multiple_choice" && "Escolha única"}
                    {question.type === "checkbox" && "Múltipla escolha"}
                    {question.type === "text" && "Resposta de texto"}
                    {question.type === "scale" && "Escala de avaliação"}
                    {question.type === "grid" && "Grade"}
                    {question.type === "dropdown" && "Lista suspensa"}
                    {question.required && " • Obrigatória"}
                    {question.conditional && " • Condicional"}
                  </p>

                  {question.conditional && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 italic">
                      <span>Exibida se:</span>
                      {(() => {
                        const dependentQuestion = formData.questions.find(q => q.id === question.conditional?.dependsOn);
                        if (!dependentQuestion) return <span>Configuração incompleta</span>;
                        
                        const conditionsText = question.conditional.conditions.map((condition, idx) => (
                          <span key={idx} className="font-medium">
                            {idx > 0 && <span className="mx-1">{question.conditional?.operator === "AND" ? "E" : "OU"}</span>}
                            <span className="bg-muted px-1 rounded">
                              {condition.value}
                            </span>
                            {condition.type === "equals" ? " for igual" : " estiver contido"}
                          </span>
                        ));
                        
                        return (
                          <>
                            <span className="font-medium">
                              {dependentQuestion.text.length > 20 
                                ? dependentQuestion.text.substring(0, 20) + "..." 
                                : dependentQuestion.text}
                            </span>
                            {conditionsText}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => moveQuestionUp(index)}
                    disabled={index === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => moveQuestionDown(index)}
                    disabled={index === formData.questions.length - 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => editQuestion(question.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-upe-red hover:text-upe-red/90 hover:bg-upe-red/10"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {(question.type === "multiple_choice" || question.type === "checkbox") && (
                <div className="mt-2 space-y-1">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      {question.type === "multiple_choice" ? (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                      ) : (
                        <div className="h-4 w-4 rounded-sm border border-muted-foreground" />
                      )}
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "dropdown" && (
                <div className="mt-2">
                  <div className="h-8 bg-muted/20 rounded-md px-3 flex items-center text-sm text-muted-foreground">
                    <span>Lista suspensa com {question.options.length} opções</span>
                  </div>
                </div>
              )}

              {question.type === "text" && <div className="mt-2 h-8 bg-muted/20 rounded-md" />}

              {question.type === "grid" && (
                <div className="mt-2 bg-muted/10 p-2 rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">
                    Grade com {question.rows?.length || 0} linhas e {question.columns?.length || 0} colunas
                  </div>
                  <div className="overflow-hidden">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          <th className="p-1 border border-muted-foreground/30 bg-muted/20"></th>
                          {question.columns?.slice(0, 3).map((col, i) => (
                            <th key={i} className="p-1 border border-muted-foreground/30 bg-muted/20 text-center">
                              {col.length > 10 ? col.substring(0, 10) + '...' : col}
                            </th>
                          ))}
                          {(question.columns?.length || 0) > 3 && (
                            <th className="p-1 border border-muted-foreground/30 bg-muted/20 text-center">...</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {question.rows?.slice(0, 2).map((row, i) => (
                          <tr key={i}>
                            <td className="p-1 border border-muted-foreground/30 font-medium">
                              {row.length > 10 ? row.substring(0, 10) + '...' : row}
                            </td>
                            {question.columns?.slice(0, 3).map((_, j) => (
                              <td key={j} className="p-1 border border-muted-foreground/30 text-center">
                                <div className="h-3 w-3 rounded-full border border-muted-foreground mx-auto"></div>
                              </td>
                            ))}
                            {(question.columns?.length || 0) > 3 && (
                              <td className="p-1 border border-muted-foreground/30 text-center">...</td>
                            )}
                          </tr>
                        ))}
                        {(question.rows?.length || 0) > 2 && (
                          <tr>
                            <td className="p-1 border border-muted-foreground/30 text-center">...</td>
                            {question.columns?.slice(0, 3).map((_, j) => (
                              <td key={j} className="p-1 border border-muted-foreground/30 text-center">...</td>
                            ))}
                            {(question.columns?.length || 0) > 3 && (
                              <td className="p-1 border border-muted-foreground/30 text-center">...</td>
                            )}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {question.type === "scale" && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">1</span>
                  <div className="flex-1 flex items-center justify-between">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="h-4 w-4 rounded-full border border-muted-foreground" />
                    ))}
                  </div>
                  <span className="text-sm">5</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  });
  
  QuestionsList.displayName = "QuestionsList";

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/admin/formularios")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-upe-blue">Novo Formulário</h1>
              <p className="text-muted-foreground">Crie um novo formulário de avaliação</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/admin/formularios")}>
              Cancelar
            </Button>
            <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" onClick={saveForm}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Formulário
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="info" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Informações Básicas
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Perguntas
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Pré-visualização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Formulário</CardTitle>
                <CardDescription>Defina as informações básicas do formulário de avaliação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Formulário</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Avaliação Institucional 2023.2"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o objetivo deste formulário de avaliação"
                      className="min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCENTES">Avaliação Docentes</SelectItem>
                        <SelectItem value="DISCENTES">Avaliação Discentes</SelectItem>
                        <SelectItem value="EGRESSOS">Avaliação Egressos</SelectItem>
                        <SelectItem value="TECNICOS_UNIDADES">Técnicos das Unidades de Ensino</SelectItem>
                        <SelectItem value="TECNICOS_COMPLEXO">Técnicos do Complexo Hospitalar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Tempo Estimado (minutos)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      placeholder="Ex: 15"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.startDate ? (
                            format(formData.startDate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => setFormData({ ...formData, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Término</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.endDate ? (
                            format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => setFormData({ ...formData, endDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="mb-4">
                  <label className="block font-medium mb-1">Status Interno</label>
                  <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status interno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Desenvolvimento <span className="text-xs text-muted-foreground">(Em desenvolvimento, não visível para usuários)</span></SelectItem>
                      <SelectItem value="ACTIVE">Pronto <span className="text-xs text-muted-foreground">(Pronto para ser publicado)</span></SelectItem>
                      <SelectItem value="CLOSED">Encerrado <span className="text-xs text-muted-foreground">(Finalizado, não aceita respostas)</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard/admin/formularios")}>
                  Cancelar
                </Button>
                <Button
                  className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                  onClick={() => setActiveTab("questions")}
                >
                  Continuar para Perguntas
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas do Formulário</CardTitle>
                  <CardDescription>Adicione e organize as perguntas do formulário</CardDescription>
                </CardHeader>
                <CardContent>
                  {formData.questions.length > 0 ? (
                    <QuestionsList />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="mb-2">Sem perguntas ainda</p>
                      <p className="text-sm text-muted-foreground">Crie perguntas usando o painel lateral</p>
                    </div>
                  )}
                </CardContent>
                {formData.questions.length > 0 && (
                  <CardFooter className="flex justify-center">
                    <Button
                      className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                      onClick={() => setActiveTab("preview")}
                    >
                      Pré-visualizar Formulário
                    </Button>
                  </CardFooter>
                )}
                {formData.questions.length === 0 && (
                  <CardFooter className="flex justify-center">
                    <Button
                      variant="outline"
                      className="w-auto"
                      onClick={() => setActiveTab("preview")}
                    >
                      Pré-visualizar Formulário
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Pergunta</CardTitle>
                  <CardDescription>Configure uma nova pergunta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-id">ID personalizado da pergunta</Label>
                    <Input
                      id="question-id"
                      placeholder="Ex: Q1, nota_final, etc."
                      value={currentQuestion.id || ""}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, id: e.target.value })}
                      maxLength={32}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-text">Título da pergunta</Label>
                    <Textarea
                      id="question-text"
                      placeholder="Digite o título da pergunta..."
                      value={currentQuestion.text}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Tipo de pergunta</Label>
                    <Select
                      value={currentQuestion.type}
                      onValueChange={(value: any) => {
                        let updates: Partial<Question> = { type: value };
                        
                        if (value === "grid" && (!currentQuestion.rows || !currentQuestion.columns)) {
                          updates.rows = ["", ""];
                          updates.columns = ["", ""];
                        }
                        
                        setCurrentQuestion({ ...currentQuestion, ...updates });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Escolha única</SelectItem>
                        <SelectItem value="checkbox">Múltipla escolha</SelectItem>
                        <SelectItem value="text">Resposta de texto</SelectItem>
                        <SelectItem value="scale">Escala de avaliação</SelectItem>
                        <SelectItem value="grid">Grade</SelectItem>
                        <SelectItem value="dropdown">Lista suspensa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="question-required" className="text-sm">Obrigatória</Label>
                      <Switch
                        id="question-required"
                        checked={currentQuestion.required}
                        onCheckedChange={(checked) => setCurrentQuestion({ ...currentQuestion, required: checked })}
                      />
                    </div>
                    
                    {formData.questions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="question-conditional" className="text-sm">Condicional</Label>
                          <Switch
                            id="question-conditional"
                            checked={!!currentQuestion.conditional}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  conditional: {
                                    dependsOn: formData.questions.length > 0 ? formData.questions[0].id : "",
                                    operator: "OR",
                                    conditions: [{ type: "equals", value: "" }]
                                  }
                                });
                              } else {
                                const { conditional, ...rest } = currentQuestion;
                                setCurrentQuestion(rest as Question);
                              }
                            }}
                          />
                        </div>
                        
                        {currentQuestion.conditional && (
                          <div className="space-y-4 pt-3 border-t">
                            <div className="space-y-2">
                              <Label>Exibir esta pergunta se</Label>
                              <Select
                                value={currentQuestion.conditional.dependsOn}
                                onValueChange={(value) => {
                                  setCurrentQuestion({
                                    ...currentQuestion,
                                    conditional: {
                                      ...currentQuestion.conditional!,
                                      dependsOn: value,
                                      conditions: [{ type: "equals", value: "" }]
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a pergunta" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.questions.map((q, i) => (
                                    <SelectItem key={q.id} value={q.id}>
                                      {i + 1}. {q.text.length > 20 ? q.text.substring(0, 20) + "..." : q.text}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Operador lógico</Label>
                              <div className="flex rounded-md overflow-hidden border">
                                <button
                                  type="button"
                                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                                    currentQuestion.conditional.operator === "OR" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                  }`}
                                  onClick={() => 
                                    setCurrentQuestion({
                                      ...currentQuestion,
                                      conditional: {
                                        ...currentQuestion.conditional,
                                        operator: "OR"
                                      }
                                    })
                                  }
                                >
                                  OU (qualquer condição)
                                </button>
                                <button
                                  type="button"
                                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                                    currentQuestion.conditional.operator === "AND" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                  }`}
                                  onClick={() => 
                                    setCurrentQuestion({
                                      ...currentQuestion,
                                      conditional: {
                                        ...currentQuestion.conditional,
                                        operator: "AND"
                                      }
                                    })
                                  }
                                >
                                  E (todas as condições)
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label>Condições</Label>
                                {currentQuestion.conditional && currentQuestion.conditional.conditions.length < 3 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCondition}
                                    className="h-8"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Adicionar condição
                                  </Button>
                                )}
                              </div>
                              
                              {currentQuestion.conditional.conditions.map((condition, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                  <Select
                                    value={condition.type}
                                    onValueChange={(value: "equals" | "contains") => updateCondition(idx, "type", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equals">For igual a</SelectItem>
                                      <SelectItem value="contains">Contiver</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  {(() => {
                                    const dependentQuestion = formData.questions.find(
                                      q => q.id === currentQuestion.conditional?.dependsOn
                                    );
                                    
                                    if (!dependentQuestion) {
                                      return (
                                        <Input
                                          value={condition.value}
                                          onChange={(e) => updateCondition(idx, "value", e.target.value)}
                                          placeholder="Valor"
                                        />
                                      );
                                    }
                                    
                                    if (
                                      dependentQuestion.type === "multiple_choice" || 
                                      dependentQuestion.type === "checkbox" || 
                                      dependentQuestion.type === "dropdown"
                                    ) {
                                      return (
                                        <Select
                                          value={condition.value}
                                          onValueChange={(value) => updateCondition(idx, "value", value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {dependentQuestion.options.map((option, optIdx) => (
                                              <SelectItem key={optIdx} value={option}>
                                                {option}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      );
                                    } 
                                    
                                    return (
                                      <Input
                                        value={condition.value}
                                        onChange={(e) => updateCondition(idx, "value", e.target.value)}
                                        placeholder="Valor"
                                      />
                                    );
                                  })()}
                                  
                                  {currentQuestion.conditional && currentQuestion.conditional.conditions.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0 text-muted-foreground hover:text-red-500"
                                      onClick={() => removeCondition(idx)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {(currentQuestion.type === "multiple_choice" || currentQuestion.type === "checkbox" || currentQuestion.type === "dropdown") && (
                    <div className="space-y-3">
                      <Label>Opções</Label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-muted-foreground hover:text-red-500"
                              onClick={() => removeOption(index)}
                              disabled={currentQuestion.options.length <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={addOption}
                          disabled={currentQuestion.options.length >= 10}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar opção
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {currentQuestion.type === "grid" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="mb-2 block">Linhas</Label>
                        <div className="space-y-2">
                          {currentQuestion.rows?.map((row, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={row}
                                onChange={(e) => updateRow(index, e.target.value)}
                                placeholder={`Linha ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-red-500"
                                onClick={() => removeRow(index)}
                                disabled={(currentQuestion.rows?.length || 0) <= 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={addRow}
                            disabled={(currentQuestion.rows?.length || 0) >= 10}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar linha
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Colunas</Label>
                        <div className="space-y-2">
                          {currentQuestion.columns?.map((column, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={column}
                                onChange={(e) => updateColumn(index, e.target.value)}
                                placeholder={`Coluna ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-red-500"
                                onClick={() => removeColumn(index)}
                                disabled={(currentQuestion.columns?.length || 0) <= 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={addColumn}
                            disabled={(currentQuestion.columns?.length || 0) >= 10}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar coluna
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  {editingQuestionId && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={cancelEditing}
                    >
                      Cancelar Edição
                    </Button>
                  )}
                  <Button
                    className={`${editingQuestionId ? 'flex-1' : 'w-full'} bg-upe-blue hover:bg-upe-blue/90 text-white`}
                    onClick={addQuestion}
                    disabled={!currentQuestion.text.trim()}
                  >
                    {editingQuestionId ? (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Pergunta
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização do Formulário</CardTitle>
                <CardDescription>Visualize como o formulário será apresentado aos usuários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 border-b pb-6">
                  <h2 className="text-2xl font-bold text-upe-blue">{formData.title || "Título do Formulário"}</h2>
                  <p className="text-muted-foreground">{formData.description || "Descrição do formulário"}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {formData.startDate && formData.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(formData.startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                          {format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {formData.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Tempo estimado: {formData.estimatedTime} minutos</span>
                      </div>
                    )}
                  </div>
                </div>

                {formData.questions.length > 0 ? (
                  <div className="space-y-8">
                    {formData.questions.map((question, index) => {
                      if (!shouldShowQuestion(question)) return null;
                      
                      return (
                        <div key={question.id} className="space-y-3">
                          <h3 className="font-medium">
                            {index + 1}. {question.text}
                            {question.required && <span className="text-upe-red ml-1">*</span>}
                          </h3>

                          {question.type === "multiple_choice" && (
                            <RadioGroup 
                              defaultValue=""
                              onValueChange={(value) => updateResponse(question.id, value)}
                            >
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`option-${question.id}-${optIndex}`} />
                                  <Label htmlFor={`option-${question.id}-${optIndex}`}>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}

                          {question.type === "checkbox" && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`checkbox-${question.id}-${optIndex}`}
                                    onCheckedChange={(checked) => {
                                      const currentValues = Array.isArray(responses[question.id]) 
                                        ? [...responses[question.id]] 
                                        : [];
                                      
                                      if (checked) {
                                        updateResponse(question.id, [...currentValues, option]);
                                      } else {
                                        updateResponse(
                                          question.id, 
                                          currentValues.filter(v => v !== option)
                                        );
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`checkbox-${question.id}-${optIndex}`}>{option}</Label>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "text" && (
                            <Textarea 
                              placeholder="Digite sua resposta aqui"
                              onChange={(e) => updateResponse(question.id, e.target.value)}
                            />
                          )}

                          {question.type === "scale" && (
                            <div className="space-y-2">
                              <div className="flex justify-between px-1">
                                <span className="text-sm">1 - Muito insatisfeito</span>
                                <span className="text-sm">5 - Muito satisfeito</span>
                              </div>
                              <RadioGroup 
                                defaultValue="" 
                                className="flex justify-between"
                                onValueChange={(value) => updateResponse(question.id, value)}
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
                            <Select onValueChange={(value) => updateResponse(question.id, value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione uma opção" />
                              </SelectTrigger>
                              <SelectContent>
                                {question.options.map((option, optIndex) => (
                                  <SelectItem key={optIndex} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {question.type === "grid" && (
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
                                                className="h-4 w-4 rounded-full border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                onChange={() => {
                                                  const currentResponses = responses[question.id] || {};
                                                  updateResponse(question.id, {
                                                    ...currentResponses,
                                                    [rowIndex]: radioValue
                                                  });
                                                }}
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
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Nenhuma pergunta adicionada</AlertTitle>
                    <AlertDescription>
                      Volte para a aba "Perguntas" e adicione perguntas ao formulário para visualizá-las aqui.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("questions")}>
                  Voltar para Perguntas
                </Button>
                <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" onClick={saveForm}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Formulário
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
