"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, PieChart, LineChart, DownloadIcon } from "lucide-react"
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line } from "recharts"

const mockForms = [
  { id: "1", title: "Avaliação Institucional 2023.2", responses: 458, categories: ["institucional"] },
  { id: "2", title: "Avaliação de Infraestrutura 2023", responses: 342, categories: ["infraestrutura"] },
  { id: "3", title: "Avaliação Docente 2023.2", responses: 567, categories: ["docente"] },
  { id: "4", title: "Avaliação de Curso - Ciência da Computação", responses: 189, categories: ["curso"] },
  { id: "5", title: "Avaliação de Curso - Engenharia", responses: 211, categories: ["curso"] },
  { id: "6", title: "Avaliação de Serviços 2023", responses: 290, categories: ["servicos"] },
]

const participationStats = [
  { name: "Institucional", participations: 979, percentage: 25 },
  { name: "Infraestrutura", participations: 342, percentage: 9 },
  { name: "Docente", participations: 567, percentage: 15 },
  { name: "Curso", participations: 400, percentage: 10 },
  { name: "Serviços", participations: 290, percentage: 7 },
]

const monthlyStats = [
  { name: "Jan", participations: 120 },
  { name: "Fev", participations: 180 },
  { name: "Mar", participations: 240 },
  { name: "Abr", participations: 300 },
  { name: "Mai", participations: 280 },
  { name: "Jun", participations: 250 },
  { name: "Jul", participations: 200 },
  { name: "Ago", participations: 340 },
  { name: "Set", participations: 420 },
  { name: "Out", participations: 390 },
  { name: "Nov", participations: 450 },
  { name: "Dez", participations: 380 },
]

// Dados simulados para as estatísticas de satisfação por categoria
const satisfactionStats = [
  { name: "Institucional", satisfaction: 4.2 },
  { name: "Infraestrutura", satisfaction: 3.7 },
  { name: "Docente", satisfaction: 4.5 },
  { name: "Curso", satisfaction: 4.0 },
  { name: "Serviços", satisfaction: 3.8 },
]

// Dados simulados para a distribuição de respostas
const responseDistribution = [
  { name: "Muito Satisfeito", value: 35 },
  { name: "Satisfeito", value: 40 },
  { name: "Neutro", value: 15 },
  { name: "Insatisfeito", value: 7 },
  { name: "Muito Insatisfeito", value: 3 },
]

// Cores para os gráficos
const COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#db2777", "#ea580c", 
  "#0d9488", "#4f46e5", "#ca8a04", "#dc2626"
];

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("visao-geral")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Relatórios</h1>
            <p className="text-muted-foreground">Análise de dados e estatísticas dos formulários de avaliação</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <DownloadIcon className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </motion.div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Avaliações</p>
                  <p className="text-3xl font-bold">2.578</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <BarChart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Participação</p>
                  <p className="text-3xl font-bold">68%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <PieChart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Média de Satisfação</p>
                  <p className="text-3xl font-bold">4.1</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <LineChart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="visao-geral" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="participacao" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
                Participação
              </TabsTrigger>
              <TabsTrigger value="satisfacao" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
                Satisfação
              </TabsTrigger>
              <TabsTrigger value="tendencias" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
                Tendências
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="2024.1">2024.1</SelectItem>
                  <SelectItem value="2023.2">2023.2</SelectItem>
                  <SelectItem value="2023.1">2023.1</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="docente">Docente</SelectItem>
                  <SelectItem value="curso">Curso</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="visao-geral" className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Participação por Categoria</CardTitle>
                <CardDescription>
                  Total de participações distribuídas por categoria de avaliação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={participationStats}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid horizontal strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="participations" fill="#2563eb" name="Participações" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição das Respostas</CardTitle>
                <CardDescription>
                  Distribuição percentual das avaliações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={responseDistribution}
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => entry.name}
                      >
                        {responseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Participação Mensal</CardTitle>
                <CardDescription>
                  Total de participações ao longo do ano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={monthlyStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="participations" 
                        name="Participações"
                        stroke="#4f46e5" 
                        activeDot={{ r: 8 }} 
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="participacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Participação por Formulário</CardTitle>
                <CardDescription>
                  Número de respostas para cada formulário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={mockForms}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid horizontal strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="title" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="responses" fill="#16a34a" name="Respostas" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Participação por Perfil</CardTitle>
                  <CardDescription>
                    Distribuição das respostas por tipo de usuário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: "Estudantes", value: 65 },
                            { name: "Professores", value: 20 },
                            { name: "Técnicos", value: 10 },
                            { name: "Outros", value: 5 },
                          ]}
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {[
                            { name: "Estudantes", value: 65 },
                            { name: "Professores", value: 20 },
                            { name: "Técnicos", value: 10 },
                            { name: "Outros", value: 5 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Participação por Campus</CardTitle>
                  <CardDescription>
                    Distribuição das respostas por campus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: "Benfica", value: 30 },
                            { name: "Santo Amaro", value: 25 },
                            { name: "Petrolina", value: 15 },
                            { name: "Garanhuns", value: 12 },
                            { name: "Outros", value: 18 },
                          ]}
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {[
                            { name: "Benfica", value: 30 },
                            { name: "Santo Amaro", value: 25 },
                            { name: "Petrolina", value: 15 },
                            { name: "Garanhuns", value: 12 },
                            { name: "Outros", value: 18 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="satisfacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nível de Satisfação por Categoria</CardTitle>
                <CardDescription>
                  Média de satisfação em uma escala de 1 a 5
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={satisfactionStats}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid horizontal strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="satisfaction" fill="#ea580c" name="Satisfação" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Satisfação por Questão</CardTitle>
                  <CardDescription>
                    Análise detalhada de questões selecionadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { name: "Infraestrutura", score: 3.8 },
                          { name: "Atendimento", score: 4.2 },
                          { name: "Biblioteca", score: 4.5 },
                          { name: "Laboratórios", score: 3.7 },
                          { name: "Salas de Aula", score: 3.9 },
                        ]}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid horizontal strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#db2777" name="Pontuação" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Satisfação</CardTitle>
                  <CardDescription>
                    Tendência da satisfação ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={[
                          { period: "2022.1", score: 3.8 },
                          { period: "2022.2", score: 3.9 },
                          { period: "2023.1", score: 4.0 },
                          { period: "2023.2", score: 4.1 },
                          { period: "2024.1", score: 4.2 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[3.5, 4.5]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#ca8a04" 
                          name="Satisfação"
                          activeDot={{ r: 8 }} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tendencias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Participação</CardTitle>
                <CardDescription>
                  Evolução da participação ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { 
                          period: "2022.1", 
                          institucional: 320, 
                          infraestrutura: 280, 
                          docente: 400 
                        },
                        { 
                          period: "2022.2", 
                          institucional: 380, 
                          infraestrutura: 300, 
                          docente: 420 
                        },
                        { 
                          period: "2023.1", 
                          institucional: 420, 
                          infraestrutura: 320, 
                          docente: 450 
                        },
                        { 
                          period: "2023.2", 
                          institucional: 458, 
                          infraestrutura: 342, 
                          docente: 567 
                        },
                        { 
                          period: "2024.1", 
                          institucional: 521, 
                          infraestrutura: 380, 
                          docente: 590 
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="institucional" 
                        stroke="#2563eb" 
                        name="Institucional"
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="infraestrutura" 
                        stroke="#16a34a" 
                        name="Infraestrutura"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="docente" 
                        stroke="#7c3aed" 
                        name="Docente"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Satisfação</CardTitle>
                  <CardDescription>
                    Comparativo entre os períodos recentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { category: "Institucional", anterior: 4.0, atual: 4.2 },
                          { category: "Infraestrutura", anterior: 3.5, atual: 3.7 },
                          { category: "Docente", anterior: 4.3, atual: 4.5 },
                          { category: "Curso", anterior: 3.9, atual: 4.0 },
                          { category: "Serviços", anterior: 3.7, atual: 3.8 },
                        ]}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid horizontal strokeDasharray="3 3" />
                        <XAxis type="number" domain={[3, 5]} />
                        <YAxis dataKey="category" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="anterior" fill="#4f46e5" name="2023.2" />
                        <Bar dataKey="atual" fill="#2563eb" name="2024.1" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Taxa de Participação</CardTitle>
                  <CardDescription>
                    Percentual de participação ao longo dos períodos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={[
                          { period: "2022.1", taxa: 52 },
                          { period: "2022.2", taxa: 57 },
                          { period: "2023.1", taxa: 61 },
                          { period: "2023.2", taxa: 65 },
                          { period: "2024.1", taxa: 68 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[50, 70]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Participação']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="taxa" 
                          stroke="#0d9488" 
                          name="Taxa de Participação"
                          activeDot={{ r: 8 }} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 