"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, CheckCircle2, Clock, FileText, Info } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [forms, setForms] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Buscar formulários disponíveis
      const formsRes = await fetch("/api/forms?available=true")
      const formsData = formsRes.ok ? await formsRes.json() : []
      setForms(formsData)
      // Buscar respostas do usuário
      const respRes = await fetch("/api/responses?userId=" + session?.user?.id)
      const respData = respRes.ok ? await respRes.json() : []
      setResponses(respData)
      setLoading(false)
    }
    if (session?.user?.id) fetchData()
  }, [session?.user?.id])

  // IDs dos formulários já respondidos
  const respondedFormIds = new Set(responses.map((r: any) => r.formId))
  // Pendentes: disponíveis e não respondidos
  const pendingForms = forms.filter((f: any) => !respondedFormIds.has(f.id))
  // Concluídas: disponíveis e respondidas
  const completedForms = forms.filter((f: any) => respondedFormIds.has(f.id))

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">
              Bem-vindo, {session?.user?.name || "Usuário"}
            </h1>
            <p className="text-muted-foreground">Confira suas avaliações e informações importantes.</p>
          </div>
        </div>

        <Alert className="mb-6 border-upe-blue/20 bg-upe-blue/5">
          <Info className="h-4 w-4 text-upe-blue" />
          <AlertTitle className="text-upe-blue">Aviso importante</AlertTitle>
          <AlertDescription>
            O período de avaliação institucional está aberto. Sua participação é fundamental!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="visao-geral" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="calendario" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Calendário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">Avaliações Pendentes</h3>
                    <FileText className="h-4 w-4 text-upe-red" />
                  </div>
                  <div className="text-3xl font-bold text-upe-blue">{loading ? "..." : pendingForms.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingForms.length > 0 ? "Você tem avaliações para responder" : "Nenhuma pendente"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">Avaliações Concluídas</h3>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-upe-blue">{loading ? "..." : completedForms.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedForms.length > 0 ? "+" + completedForms.length + " concluídas" : "Nenhuma concluída"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">Próximo Evento</h3>
                    <Calendar className="h-4 w-4 text-upe-blue" />
                  </div>
                  <div className="text-lg font-bold text-upe-blue">Divulgação de Resultados</div>
                  <p className="text-xs text-muted-foreground">15/07/2023</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold text-upe-blue mb-4">Avaliações Recentes</h2>
              <p className="text-sm text-muted-foreground mb-4">Formulários disponíveis para preenchimento</p>

              <div className="space-y-4">
                {loading ? (
                  <div>Carregando...</div>
                ) : pendingForms.length === 0 ? (
                  <div className="text-muted-foreground">Nenhuma avaliação pendente.</div>
                ) : (
                  pendingForms.slice(0, 5).map((form) => (
                    <Card key={form.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div>
                            <h3 className="font-medium text-upe-blue">{form.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Prazo: {form.deadline ? new Date(form.deadline).toLocaleDateString() : "-"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Tempo estimado: {form.estimatedTime || "-"} min</span>
                            </div>
                            <Button size="sm" className="bg-upe-red hover:bg-upe-red/90 text-white" asChild>
                              <Link href={`/dashboard/avaliacoes/responder/${form.id}`}>Responder</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/avaliacoes">Ver todas as avaliações</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mensagens">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-upe-blue mb-4">Mensagens da CPA</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Comunicados importantes da Comissão Própria de Avaliação
                </p>

                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-upe-blue">{message.title}</h3>
                        <span className="text-xs text-muted-foreground">{message.date}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{message.content}</p>
                      {message.link && (
                        <Button variant="link" className="mt-1 h-auto p-0 text-upe-blue" asChild>
                          <Link href={message.link.url}>{message.link.text}</Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-upe-blue mb-4">Calendário de Avaliações</h2>
                <p className="text-sm text-muted-foreground mb-4">Datas importantes do processo avaliativo</p>

                <div className="space-y-4">
                  {calendarEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-upe-blue/10 text-upe-blue">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-medium text-upe-blue">{event.title}</h3>
                          <span className="text-xs font-medium text-upe-red">{event.date}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

const recentForms = [
  {
    title: "Avaliação Institucional 2023.2",
    description: "Avaliação geral da instituição para o semestre 2023.2",
    deadline: "30/06/2023",
    estimatedTime: "15 minutos",
  },
  {
    title: "Avaliação de Infraestrutura",
    description: "Avaliação das instalações físicas e recursos tecnológicos",
    deadline: "15/06/2023",
    estimatedTime: "10 minutos",
  },
]

const messages = [
  {
    title: "Novo ciclo de avaliação",
    content:
      "O novo ciclo de avaliação institucional começou. Sua participação é fundamental para a melhoria contínua da nossa universidade.",
    date: "01/05/2023",
    link: {
      text: "Saiba mais",
      url: "#",
    },
  },
  {
    title: "Resultados da última avaliação",
    content: "Os resultados da avaliação do semestre 2022.2 já estão disponíveis para consulta na área de relatórios.",
    date: "20/04/2023",
    link: {
      text: "Ver resultados",
      url: "#",
    },
  },
  {
    title: "Melhorias implementadas",
    content:
      "Com base nas avaliações anteriores, diversas melhorias foram implementadas nos laboratórios e bibliotecas.",
    date: "15/04/2023",
  },
]

const calendarEvents = [
  {
    title: "Período de Avaliação Institucional",
    date: "01/05/2023 a 30/06/2023",
    description: "Período para preenchimento dos formulários de avaliação institucional.",
  },
  {
    title: "Divulgação dos Resultados",
    date: "15/07/2023",
    description: "Publicação dos resultados consolidados da avaliação institucional.",
  },
  {
    title: "Apresentação do Plano de Melhorias",
    date: "01/08/2023",
    description: "Apresentação das ações de melhoria baseadas nos resultados da avaliação.",
  },
]
