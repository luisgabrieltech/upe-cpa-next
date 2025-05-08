"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, FileText, Search } from "lucide-react"
import Link from "next/link"

export default function AvaliacoesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAvailable = availableForms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCompleted = completedForms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Avaliações</h1>
            <p className="text-muted-foreground">Gerencie e responda suas avaliações</p>
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
            {filteredAvailable.length > 0 ? (
              filteredAvailable.map((form, index) => (
                <Card key={index}>
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
                            <span>Prazo: {form.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Tempo estimado: {form.estimatedTime}</span>
                          </div>
                        </div>
                        <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" asChild>
                          <Link href={`/dashboard/avaliacoes/responder/${form.id}`}>
                            Responder
                          </Link>
                        </Button>
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
                    Não há avaliações disponíveis que correspondam à sua busca.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredCompleted.length > 0 ? (
              filteredCompleted.map((form, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="font-medium text-upe-blue">{form.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>Concluída em: {form.completedDate}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="border-upe-blue text-upe-blue hover:bg-upe-blue/10">
                            Ver Respostas
                          </Button>
                          {form.resultsAvailable && (
                            <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white">Ver Resultados</Button>
                          )}
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

const availableForms = [
  {
    id: "form-1",
    title: "Avaliação Institucional 2023.2",
    description: "Avaliação geral da instituição para o semestre 2023.2",
    deadline: "30/06/2023",
    estimatedTime: "15 minutos",
  },
  {
    id: "form-2",
    title: "Avaliação de Infraestrutura",
    description: "Avaliação das instalações físicas e recursos tecnológicos",
    deadline: "15/06/2023",
    estimatedTime: "10 minutos",
  },
]

const completedForms = [
  {
    id: "form-3",
    title: "Avaliação Institucional 2022.2",
    description: "Avaliação geral da instituição para o semestre 2022.2",
    completedDate: "15/12/2022",
    resultsAvailable: true,
  },
  {
    id: "form-4",
    title: "Avaliação de Infraestrutura 2022",
    description: "Avaliação das instalações físicas e recursos tecnológicos",
    completedDate: "10/12/2022",
    resultsAvailable: true,
  },
  {
    id: "form-5",
    title: "Avaliação Docente 2022.2",
    description: "Avaliação do corpo docente pelos discentes",
    completedDate: "05/12/2022",
    resultsAvailable: false,
  },
]
