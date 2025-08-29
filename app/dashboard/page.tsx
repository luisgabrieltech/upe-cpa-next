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
import { getApiUrl } from "@/lib/api-utils"
import { routes } from "@/lib/routes"
import { getUserFunctionalRoles, canUserViewForm, FUNCTIONAL_ROLES_OPTIONS } from "@/lib/user-utils"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [forms, setForms] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return
      
      setLoading(true)
      const [formsRes, responsesRes, profileRes] = await Promise.all([
        fetch(getApiUrl('forms')), // API já filtra por roles funcionais automaticamente
        fetch(getApiUrl('responses?user=me')),
        fetch(getApiUrl('user/profile')),
      ])
      
      if (formsRes.ok) {
        setForms(await formsRes.json())
      }
      if (responsesRes.ok) {
        setResponses(await responsesRes.json())
      }
      if (profileRes.ok) {
        setUserProfile(await profileRes.json())
      }
      
      setLoading(false)
    }
    fetchData()
  }, [session?.user?.id])

  // IDs dos formulários já respondidos
  const respondedFormIds = new Set(responses.map((r: any) => r.formId))
  
  // Pendentes: AVAILABLE e não respondidos (API já filtra por roles funcionais)
  const pendingForms = forms.filter((form: any) => {
    // 1. Status deve ser AVAILABLE
    if (form.externalStatus !== "AVAILABLE") return false
    
    // 2. Não pode ter respondido
    if (respondedFormIds.has(form.id)) return false
    
    // 3. Verificação adicional de roles (dupla segurança)
    if (userProfile && form.visibleToRoles && form.visibleToRoles.length > 0) {
      const userFunctionalRoles = getUserFunctionalRoles(userProfile.extraData)
      const hasPermission = canUserViewForm(userFunctionalRoles, form.visibleToRoles)
      if (!hasPermission) return false
    }
    
    return true
  })
  
  // Concluídas: não HIDDEN e já respondidas
  const completedForms = forms.filter((form: any) => {
    // 1. Status não pode ser HIDDEN
    if (form.externalStatus === "HIDDEN") return false
    
    // 2. Deve ter respondido
    if (!respondedFormIds.has(form.id)) return false
    
    // 3. Verificação adicional de roles (dupla segurança)
    if (userProfile && form.visibleToRoles && form.visibleToRoles.length > 0) {
      const userFunctionalRoles = getUserFunctionalRoles(userProfile.extraData)
      const hasPermission = canUserViewForm(userFunctionalRoles, form.visibleToRoles)
      if (!hasPermission) return false
    }
    
    return true
  })

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">
              Bem-vindo, {session?.user?.name || "Usuário"}
            </h1>
            <p className="text-muted-foreground">Confira suas avaliações e informações importantes.</p>
            {userProfile && userProfile.functionalRoles && userProfile.functionalRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Suas roles:</span>
                {userProfile.functionalRoles.map((role: string) => {
                  const roleLabel = FUNCTIONAL_ROLES_OPTIONS.find(r => r.value === role)?.label || role
                  return (
                    <span key={role} className="text-xs bg-upe-blue/10 text-upe-blue px-2 py-1 rounded">
                      {roleLabel}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <Alert className="mb-6 border-upe-blue/20 bg-upe-blue/5">
          <Info className="h-4 w-4 text-upe-blue" />
          <AlertTitle className="text-upe-blue">Bem-vindo ao novo Sistema CPA</AlertTitle>
          <AlertDescription>
            O sistema está em fase de implementação. Em breve iniciaremos um novo ciclo de avaliações.
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
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                      <div className="text-muted-foreground">Carregando avaliações...</div>
                    </CardContent>
                  </Card>
                ) : pendingForms.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <div className="text-muted-foreground mb-2">Nenhuma avaliação pendente</div>
                      {userProfile && userProfile.functionalRoles && userProfile.functionalRoles.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Você tem acesso a formulários para: {userProfile.functionalRoles.map((role: string) => 
                            FUNCTIONAL_ROLES_OPTIONS.find(r => r.value === role)?.label || role
                          ).join(", ")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
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
                              <Link href={routes.dashboard.evaluations.respond(form.id)}>Responder</Link>
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
                  <Link href={routes.dashboard.evaluations.home}>Ver todas as avaliações</Link>
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
    title: "Avaliação Institucional 2025.1",
    description: "Avaliação geral da instituição para o semestre 2025.1",
    deadline: "Em breve",
    estimatedTime: "15 minutos",
  },
  {
    title: "Avaliação de Infraestrutura",
    description: "Avaliação das instalações físicas e recursos tecnológicos",
    deadline: "Em breve",
    estimatedTime: "10 minutos",
  },
]

const messages = [
  {
    title: "Bem-vindo ao novo Sistema CPA",
    content:
      "O novo sistema da CPA está no ar! Agora você pode participar das avaliações de forma mais simples e intuitiva.",
    date: "2025",
    link: {
      text: "Saiba mais",
      url: "#",
    },
  },
  {
    title: "Próximo Ciclo de Avaliação",
    content: "Fique atento! Em breve iniciaremos um novo ciclo de avaliação institucional.",
    date: "2025",
    link: {
      text: "Ver calendário",
      url: "#",
    },
  },
  {
    title: "Importância da sua Participação",
    content:
      "Sua opinião é fundamental para a melhoria contínua da nossa universidade. Participe quando as avaliações estiverem disponíveis.",
    date: "2025",
  },
]

const calendarEvents = [
  {
    title: "Preparação do Ciclo Avaliativo",
    date: "2025",
    description: "Período de organização e planejamento das avaliações do próximo ciclo.",
  },
  {
    title: "Próximo Período de Avaliação",
    date: "A definir",
    description: "As datas do próximo ciclo de avaliação serão divulgadas em breve.",
  },
  {
    title: "Divulgação dos Resultados",
    date: "Após conclusão do ciclo",
    description: "Os resultados serão publicados após a finalização do período avaliativo.",
  },
]
