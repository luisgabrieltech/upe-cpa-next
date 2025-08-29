"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, FileText, Search } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { getApiUrl } from "@/lib/api-utils"
import { routes } from "@/lib/routes"
import { getUserFunctionalRoles, canUserViewForm, FUNCTIONAL_ROLES_OPTIONS } from "@/lib/user-utils"

export default function AvaliacoesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [forms, setForms] = useState<any[]>([])
  const [userResponses, setUserResponses] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return
      
      setLoading(true)
      const [formsRes, responsesRes, profileRes] = await Promise.all([
        fetch(getApiUrl('forms')), // API já filtra por roles funcionais
        fetch(getApiUrl('responses?user=me')),
        fetch(getApiUrl('user/profile')),
      ])
      
      if (formsRes.ok) {
        setForms(await formsRes.json())
      }
      if (responsesRes.ok) {
        setUserResponses(await responsesRes.json())
      }
      if (profileRes.ok) {
        setUserProfile(await profileRes.json())
      }
      
      setLoading(false)
    }
    fetchData()
  }, [session?.user?.id])

  // IDs dos formulários já respondidos pelo usuário
  const respondedFormIds = Array.from(new Set(userResponses.map((r: any) => r.formId)))

  const filteredAvailable = forms.filter((form) => {
    // 1. Status deve ser AVAILABLE
    if (form.externalStatus !== "AVAILABLE") return false
    
    // 2. Não pode ter respondido
    if (respondedFormIds.includes(form.id)) return false
    
    // 3. Verificar roles funcionais (dupla segurança - API já filtra, mas validamos localmente também)
    if (userProfile && form.visibleToRoles && form.visibleToRoles.length > 0) {
      const userFunctionalRoles = getUserFunctionalRoles(userProfile.extraData)
      const hasPermission = canUserViewForm(userFunctionalRoles, form.visibleToRoles)
      if (!hasPermission) return false
    }
    
    // 4. Filtro de busca
    return (
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const filteredCompleted = forms.filter((form) => {
    // 1. Status não pode ser HIDDEN
    if (form.externalStatus === "HIDDEN") return false
    
    // 2. Deve ter respondido
    if (!respondedFormIds.includes(form.id)) return false
    
    // 3. Verificar roles funcionais (dupla segurança)
    if (userProfile && form.visibleToRoles && form.visibleToRoles.length > 0) {
      const userFunctionalRoles = getUserFunctionalRoles(userProfile.extraData)
      const hasPermission = canUserViewForm(userFunctionalRoles, form.visibleToRoles)
      if (!hasPermission) return false
    }
    
    // 4. Filtro de busca
    return (
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Avaliações</h1>
            <p className="text-muted-foreground">Gerencie e responda suas avaliações</p>
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
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar avaliações..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="available" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Disponíveis
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Concluídas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                  <h3 className="text-lg font-medium">Carregando avaliações...</h3>
                </CardContent>
              </Card>
            ) : filteredAvailable.length > 0 ? (
              filteredAvailable.map((form, index) => (
                <Card key={form.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="font-medium text-upe-blue">{form.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Prazo: {form.deadline ? new Date(form.deadline).toLocaleDateString() : '-'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Tempo estimado: {form.estimatedTime || '-'} min</span>
                          </div>
                          {form.externalStatus === "FROZEN" && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Congelado para respostas</span>
                          )}
                          {form.externalStatus === "SCHEDULED" && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Em breve</span>
                          )}
                        </div>
                        {form.externalStatus === "AVAILABLE" ? (
                          <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" asChild>
                            <Link href={routes.dashboard.evaluations.respond(form.id)}>
                              Responder
                            </Link>
                          </Button>
                        ) : (
                          <Button disabled variant="outline">Indisponível</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhuma avaliação encontrada</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery 
                      ? "Não há avaliações disponíveis que correspondam à sua busca."
                      : "Não há avaliações disponíveis para suas roles funcionais ou todas já foram respondidas."
                    }
                  </p>
                  {userProfile && userProfile.functionalRoles && userProfile.functionalRoles.length > 0 && !searchQuery && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Você tem acesso a formulários para: {userProfile.functionalRoles.map((role: string) => 
                        FUNCTIONAL_ROLES_OPTIONS.find(r => r.value === role)?.label || role
                      ).join(", ")}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                  <h3 className="text-lg font-medium">Carregando avaliações concluídas...</h3>
                </CardContent>
              </Card>
            ) : filteredCompleted.length > 0 ? (
              filteredCompleted.map((form, index) => (
                <Card key={form.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="font-medium text-upe-blue">{form.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Você já respondeu esta avaliação.</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhuma avaliação concluída</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você ainda não concluiu nenhuma avaliação ou nenhuma corresponde à sua busca.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

