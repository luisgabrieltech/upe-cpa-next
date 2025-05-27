"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Activity,
  Calendar,
  User,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { getApiUrl } from "@/lib/api-utils"

export default function AdminDashboardPage() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [formCount, setFormCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Buscar usuários
      const userRes = await fetch(getApiUrl('user'))
      let users = []
      if (userRes.ok) {
        users = await userRes.json()
        setUserCount(users.length)
      }
      // Buscar formulários
      const formRes = await fetch(getApiUrl('forms'))
      let forms = []
      if (formRes.ok) {
        forms = await formRes.json()
        setFormCount(forms.length)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie avaliações, usuários e visualize estatísticas do sistema</p>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-4">
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium">Total de Usuários</h3>
                  <Users className="h-4 w-4 text-upe-blue" />
                </div>
                <div className="text-3xl font-bold text-upe-blue">{loading ? '...' : userCount}</div>
                {/* <p className="text-xs text-muted-foreground">+32 novos esta semana</p> */}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium">Formulários Ativos</h3>
                  <ClipboardList className="h-4 w-4 text-upe-blue" />
                </div>
                <div className="text-3xl font-bold text-upe-blue">{loading ? '...' : formCount}</div>
                {/* <p className="text-xs text-muted-foreground">2 pendentes de liberação</p> */}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium">Taxa de Participação</h3>
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-upe-blue">Null</div>
                <p className="text-xs text-muted-foreground">Null em relação ao último ciclo</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium">Próximo Ciclo</h3>
                  <Calendar className="h-4 w-4 text-upe-red" />
                </div>
                <div className="text-lg font-bold text-upe-blue">Avaliação 2025.2</div>
                <p className="text-xs text-muted-foreground">Inicia em Null dias</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="logs" className="mt-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="logs" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Logs de Atividades
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Atividades Administrativas</CardTitle>
                <CardDescription>Registro das ações administrativas recentes no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8 text-lg font-medium">
                  Em desenvolvimento...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Sistema</CardTitle>
                <CardDescription>Visão geral das métricas de uso e participação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Distribuição de Usuários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Gráfico de distribuição de usuários por tipo</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-upe-blue"></div>
                          <span className="text-sm">Estudantes: 980</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-upe-red"></div>
                          <span className="text-sm">Professores: 156</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Técnicos: 92</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">Externos: 20</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Participação por Ciclo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Gráfico de participação por ciclo de avaliação</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">2022.1</span>
                          <span className="text-sm font-medium">52%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">2022.2</span>
                          <span className="text-sm font-medium">56%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">2023.1</span>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

const activityLogs = [
  {
    timestamp: "24/04/2023 14:32",
    user: "Maria Oliveira (Coordenadora)",
    action: "Liberou formulário",
    actionIcon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    details: "Avaliação Institucional 2023.1",
  },
  {
    timestamp: "24/04/2023 11:15",
    user: "Carlos Santos (Admin)",
    action: "Criou formulário",
    actionIcon: <FileText className="h-4 w-4 text-upe-blue" />,
    details: "Avaliação de Infraestrutura 2023",
  },
  {
    timestamp: "23/04/2023 16:48",
    user: "Ana Silva (CPA)",
    action: "Atualizou formulário",
    actionIcon: <Clock className="h-4 w-4 text-yellow-500" />,
    details: "Estendeu prazo da Avaliação Docente 2023.1",
  },
  {
    timestamp: "22/04/2023 09:23",
    user: "Pedro Costa (Admin)",
    action: "Bloqueou usuário",
    actionIcon: <AlertTriangle className="h-4 w-4 text-upe-red" />,
    details: "Usuário: jose.almeida@upe.br",
  },
  {
    timestamp: "21/04/2023 15:10",
    user: "Maria Oliveira (Coordenadora)",
    action: "Adicionou usuário",
    actionIcon: <User className="h-4 w-4 text-upe-blue" />,
    details: "Novo coordenador: roberto.lima@upe.br",
  },
]
