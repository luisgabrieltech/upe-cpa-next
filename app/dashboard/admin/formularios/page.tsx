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
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

export default function AdminFormulariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true)
      const res = await fetch("/api/forms")
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

    const matchesStatus = statusFilter === "all" || form.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteClick = (formId: string) => {
    setDeleteFormId(formId)
    setIsDeleteDialogOpen(true)
  }

  // Função para confirmar a exclusão
  const confirmDelete = () => {
    // Aqui seria implementada a lógica para excluir o formulário
    console.log(`Excluindo formulário ${deleteFormId}`)
    setIsDeleteDialogOpen(false)
    setDeleteFormId(null)
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
            <Link href="/dashboard/admin/formularios/novo">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                    <SelectItem value="closed">Encerrados</SelectItem>
                    <SelectItem value="frozen">Congelados</SelectItem>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.length > 0 ? (
                      filteredForms.map((form) => (
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
                          <TableCell>{form.createdAt}</TableCell>
                          <TableCell>{form.deadline}</TableCell>
                          <TableCell>{form.responses}</TableCell>
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
                                  <Link href={`/dashboard/admin/formularios/${form.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Visualizar</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/admin/formularios/${form.id}/editar`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {form.status === "active" ? (
                                  <DropdownMenuItem>
                                    <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                                    <span>Bloquear</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
                                    <Unlock className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Liberar</span>
                                  </DropdownMenuItem>
                                )}
                                {form.status === "frozen" ? (
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-upe-blue" />
                                    <span>Descongelar</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
                                    <Clock className="mr-2 h-4 w-4 text-upe-blue" />
                                    <span>Congelar</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-upe-red focus:text-upe-red"
                                  onClick={() => handleDeleteClick(form.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
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
                Você está prestes a excluir um formulário. Esta ação não pode ser desfeita e todos os dados associados
                serão perdidos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">Tem certeza que deseja excluir este formulário?</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Sim, excluir formulário
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
      return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
    case "draft":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Rascunho
        </Badge>
      )
    case "closed":
      return (
        <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
          Encerrado
        </Badge>
      )
    case "frozen":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Congelado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
