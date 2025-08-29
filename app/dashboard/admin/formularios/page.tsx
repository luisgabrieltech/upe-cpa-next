"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  Snowflake,
  EyeOff,
  Calendar,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/api-utils"
import { routes } from "@/lib/routes"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/user-utils"

export default function AdminFormulariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [visibilityFormId, setVisibilityFormId] = useState<string | null>(null)
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("HIDDEN")
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("")
  const [deleteFormName, setDeleteFormName] = useState("")
  const [statusType, setStatusType] = useState<'internal' | 'external'>('internal')
  const router = useRouter()

  // Usar roles funcionais da lib
  const roles = FUNCTIONAL_ROLES_OPTIONS

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true)
      const res = await fetch(getApiUrl('forms'))
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      }
      setLoading(false)
    }
    fetchForms()
  }, [])

  // Filtragem de formulários
  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter !== "all") {
      if (statusType === 'internal') {
        matchesStatus = (form.status?.toLowerCase() === statusFilter.toLowerCase())
      } else {
        matchesStatus = (form.externalStatus === statusFilter)
      }
    }

    return matchesSearch && matchesStatus
  })

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteClick = (formId: string, formName: string) => {
    setDeleteFormId(formId)
    setDeleteFormName(formName)
    setDeleteConfirmInput("")
    setIsDeleteDialogOpen(true)
  }

  // Função para confirmar a exclusão
  const confirmDelete = async () => {
    if (!deleteFormId) return
    await fetch(getApiUrl('forms'), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteFormId }),
    })
    setIsDeleteDialogOpen(false)
    setDeleteFormId(null)
    setDeleteFormName("")
    setDeleteConfirmInput("")
    setForms(prev => prev.filter(f => f.id !== deleteFormId))
  }

  const openVisibilityDialog = (form: any) => {
    setVisibilityFormId(form.id)
    setSelectedRoles(form.visibleToRoles || [])
    setSelectedStatus(form.externalStatus || "HIDDEN")
    setIsVisibilityDialogOpen(true)
  }

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

  const columns = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }: any) => {
        const title = row.getValue("title") as string
        return (
          <div className="flex flex-col">
            <span>{title}</span>
            <span className="text-xs text-muted-foreground">{row.getValue("description") as string}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status Interno",
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={
            status === "ACTIVE" ? "default" :
            status === "DRAFT" ? "secondary" :
            status === "CLOSED" ? "destructive" :
            "outline"
          }>
            {status === "ACTIVE" ? "Ativo" :
             status === "DRAFT" ? "Rascunho" :
             status === "CLOSED" ? "Encerrado" :
             status === "FROZEN" ? "Congelado" :
             status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "externalStatus",
      header: "Status Externo",
      cell: ({ row }: any) => {
        const status = row.getValue("externalStatus") as string
        return (
          <Badge variant={
            status === "AVAILABLE" ? "default" :
            status === "HIDDEN" ? "secondary" :
            status === "FROZEN" ? "destructive" :
            status === "SCHEDULED" ? "outline" :
            "outline"
          }>
            {status === "AVAILABLE" ? "Disponível" :
             status === "HIDDEN" ? "Oculto" :
             status === "FROZEN" ? "Congelado" :
             status === "SCHEDULED" ? "Agendado" :
             status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }: any) => {
        const createdAt = row.getValue("createdAt") as string
        return createdAt ? format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"
      },
    },
    {
      accessorKey: "deadline",
      header: "Prazo",
      cell: ({ row }: any) => {
        const deadline = row.getValue("deadline") as string
        return deadline ? format(new Date(deadline), "dd/MM/yyyy", { locale: ptBR }) : "-"
      },
    },
    {
      accessorKey: "estimatedTime",
      header: "Tempo Estimado",
      cell: ({ row }: any) => {
        const estimatedTime = row.getValue("estimatedTime") as number
        return estimatedTime ? `${estimatedTime} min` : "-"
      },
    },
    {
      accessorKey: "responses",
      header: "Respostas",
      cell: ({ row }: any) => {
        const responses = row.getValue("responses") as number
        return responses.toString()
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={`${routes.dashboard.admin.forms.home}/preview/${form.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Visualizar</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${routes.dashboard.admin.forms.new}/${form.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openVisibilityDialog(form)}>
                <Users className="mr-2 h-4 w-4 text-upe-blue" />
                <span>Gerenciar visibilidade</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                const res = await fetch(getApiUrl(`forms?id=${form.id}`))
                if (res.ok) {
                  const data = await res.json()
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `formulario-${form.id}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } else {
                  alert('Erro ao baixar formulário')
                }
              }}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Baixar JSON</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-upe-red focus:text-upe-red"
                onClick={() => handleDeleteClick(form.id, form.title)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const updateFormStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(getApiUrl('forms?action=status'), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Erro ao atualizar status")
      }
    } catch (error) {
      alert("Erro ao atualizar status")
    }
  }

  const updateFormExternalStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(getApiUrl('forms?action=external-status'), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Erro ao atualizar status")
      }
    } catch (error) {
      alert("Erro ao atualizar status")
    }
  }

  const deleteForm = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`forms?id=${id}`), {
        method: "DELETE",
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Erro ao excluir formulário")
      }
    } catch (error) {
      alert("Erro ao excluir formulário")
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Gestão de Formulários</h1>
            <p className="text-muted-foreground">Crie, edite e gerencie formulários de avaliação</p>
          </div>
          <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" asChild>
            <Link href={routes.dashboard.admin.forms.new}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Formulário
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtros e Busca</CardTitle>
              <CardDescription>Filtre e busque formulários por status ou palavras-chave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar formulários..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusType} onValueChange={v => setStatusType(v as 'internal' | 'external')}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Tipo de status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Status Interno</SelectItem>
                    <SelectItem value="external">Status Externo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusType === 'internal' ? (
                      <>
                        <SelectItem value="active">Pronto</SelectItem>
                        <SelectItem value="draft">Desenvolvimento</SelectItem>
                        <SelectItem value="closed">Encerrado</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="AVAILABLE">Disponível</SelectItem>
                        <SelectItem value="HIDDEN">Oculto</SelectItem>
                        <SelectItem value="FROZEN">Congelado</SelectItem>
                        <SelectItem value="SCHEDULED">Agendado</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Formulários de Avaliação</CardTitle>
                <CardDescription>
                  Total: {filteredForms.length} formulários{" "}
                  {statusFilter !== "all" ? `com status "${statusFilter}"` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status Interno</TableHead>
                      <TableHead>Status Externo</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Tempo Estimado</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.length > 0 ? (
                      filteredForms.map((form) => {
                        const criadoEm = form.createdAt ? format(new Date(form.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-";
                        const prazo = form.deadline ? format(new Date(form.deadline), "dd/MM/yyyy", { locale: ptBR }) : "-";
                        const tempoEstimado = form.estimatedTime ? `${form.estimatedTime} min` : "-";
                        return (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{form.title}</span>
                                <span className="text-xs text-muted-foreground">{form.description}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={form.status} />
                            </TableCell>
                            <TableCell>
                              <ExternalStatusBadge status={form.externalStatus} />
                            </TableCell>
                            <TableCell>{criadoEm}</TableCell>
                            <TableCell>{prazo}</TableCell>
                            <TableCell>{tempoEstimado}</TableCell>
                            <TableCell>{new Set(form.responses.map((r: any) => r.userId)).size}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Abrir menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <a href={`${routes.dashboard.admin.forms.home}/preview/${form.id}`} target="_blank" rel="noopener noreferrer">
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Visualizar</span>
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`${routes.dashboard.admin.forms.new}/${form.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Editar</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openVisibilityDialog(form)}>
                                    <Users className="mr-2 h-4 w-4 text-upe-blue" />
                                    <span>Gerenciar visibilidade</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={async () => {
                                    const res = await fetch(getApiUrl(`forms?id=${form.id}`))
                                    if (res.ok) {
                                      const data = await res.json()
                                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = `formulario-${form.id}.json`
                                      document.body.appendChild(a)
                                      a.click()
                                      document.body.removeChild(a)
                                      URL.revokeObjectURL(url)
                                    } else {
                                      alert('Erro ao baixar formulário')
                                    }
                                  }}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Baixar JSON</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-upe-red focus:text-upe-red"
                                    onClick={() => handleDeleteClick(form.id, form.title)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-8 w-8 mb-2" />
                            <p>Nenhum formulário encontrado</p>
                            <p className="text-sm">Tente ajustar os filtros ou criar um novo formulário</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-upe-red">
                <AlertTriangle className="h-5 w-5" />
                Confirmar exclusão
              </DialogTitle>
              <DialogDescription>
                <span className="font-semibold text-upe-red">Atenção!</span><br />
                Você está prestes a excluir o formulário <b>{deleteFormName}</b>.<br />
                <span className="text-sm">Todas as perguntas e respostas associadas serão <b>apagadas permanentemente</b>.</span><br />
                <br />
                Para confirmar, digite o nome exato do formulário abaixo:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Digite o nome do formulário"
                value={deleteConfirmInput}
                onChange={e => setDeleteConfirmInput(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteConfirmInput !== deleteFormName}
              >
                Sim, excluir formulário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isVisibilityDialogOpen} onOpenChange={setIsVisibilityDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Visibilidade</DialogTitle>
              <DialogDescription>
                Defina o status e as roles funcionais que podem visualizar este formulário
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {/* Status do Formulário */}
              <div>
                <label className="block font-medium mb-2">Status do Formulário</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIDDEN">🙈 Oculto</SelectItem>
                    <SelectItem value="AVAILABLE">✅ Disponível</SelectItem>
                    <SelectItem value="FROZEN">🧊 Congelado</SelectItem>
                    <SelectItem value="SCHEDULED">⏰ Agendado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Status "Oculto" torna o formulário invisível para todos os usuários
                </p>
              </div>

              {/* Roles Funcionais Permitidas */}
              <div>
                <label className="block font-medium mb-2">Roles Funcionais Permitidas</label>
                <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 bg-muted/20">
                  {roles.map((role) => (
                    <label key={role.value} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                      <Checkbox
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setSelectedRoles([...selectedRoles, role.value])
                          } else {
                            setSelectedRoles(selectedRoles.filter(r => r !== role.value))
                          }
                        }}
                        id={`role-${role.value}`}
                      />
                      <span className="flex-1">{role.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedRoles.length === 0 
                    ? "⚠️ Se nenhuma role for selecionada, o formulário será público para todos os usuários" 
                    : `✅ Visível apenas para: ${roles.filter(r => selectedRoles.includes(r.value)).map(r => r.label).join(", ")}`
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVisibilityDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-upe-blue text-white" onClick={async () => {
                if (!visibilityFormId) return
                const res = await fetch(getApiUrl('forms?action=visibility'), {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: visibilityFormId,
                    visibleToRoles: selectedRoles,
                    status: selectedStatus,
                  }),
                })
                if (res.ok) {
                  const updatedForm = await res.json()
                  setForms(prev => prev.map(f => f.id === updatedForm.id ? { ...f, ...updatedForm } : f))
                }
                setIsVisibilityDialogOpen(false)
              }}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
    case "ACTIVE":
      return <Badge className="bg-green-500 hover:bg-green-600">Pronto</Badge>
    case "draft":
    case "DRAFT":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Desenvolvimento
        </Badge>
      )
    case "closed":
    case "CLOSED":
      return (
        <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
          Encerrado
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function ExternalStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AVAILABLE":
      return <Badge className="bg-green-500 hover:bg-green-600">Disponível</Badge>
    case "HIDDEN":
      return <Badge variant="outline" className="text-muted-foreground">Oculto</Badge>
    case "FROZEN":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Congelado</Badge>
    case "SCHEDULED":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Agendado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
