"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  UserPlus,
  Mail,
  Key,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminUsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Filtragem de usuários
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId)
    setIsDeleteDialogOpen(true)
  }

  // Função para abrir o diálogo de redefinição de senha
  const handleResetPasswordClick = (userId: string) => {
    setSelectedUserId(userId)
    setIsResetPasswordDialogOpen(true)
  }

  // Função para confirmar a exclusão
  const confirmDelete = () => {
    // Aqui seria implementada a lógica para excluir o usuário
    console.log(`Excluindo usuário ${selectedUserId}`)
    setIsDeleteDialogOpen(false)
    setSelectedUserId(null)
  }

  // Função para confirmar a redefinição de senha
  const confirmResetPassword = () => {
    // Aqui seria implementada a lógica para redefinir a senha
    console.log(`Redefinindo senha do usuário ${selectedUserId}`)
    setIsResetPasswordDialogOpen(false)
    setSelectedUserId(null)
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
            <h1 className="text-2xl font-bold text-upe-blue">Gestão de Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
          </div>
          <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Usuário
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
              <CardDescription>Filtre e busque usuários por cargo ou palavras-chave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar usuários por nome ou e-mail..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por cargo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cargos</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="coordenador">Coordenadores</SelectItem>
                    <SelectItem value="cpa">Membros da CPA</SelectItem>
                    <SelectItem value="professor">Professores</SelectItem>
                    <SelectItem value="aluno">Alunos</SelectItem>
                    <SelectItem value="tecnico">Técnicos</SelectItem>
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
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  Total: {filteredUsers.length} usuários {roleFilter !== "all" ? `com cargo "${roleFilter}"` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="bg-upe-blue text-white">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell>
                            {user.active ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Ver Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Enviar E-mail</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPasswordClick(user.id)}>
                                  <Key className="mr-2 h-4 w-4" />
                                  <span>Redefinir Senha</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.active ? (
                                  <DropdownMenuItem>
                                    <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                                    <span>Desativar Usuário</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
                                    <Unlock className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Ativar Usuário</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-upe-red focus:text-upe-red"
                                  onClick={() => handleDeleteClick(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir Usuário</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <User className="h-8 w-8 mb-2" />
                            <p>Nenhum usuário encontrado</p>
                            <p className="text-sm">Tente ajustar os filtros ou adicionar novos usuários</p>
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
                Você está prestes a excluir um usuário. Esta ação não pode ser desfeita e todos os dados associados
                serão perdidos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">Tem certeza que deseja excluir este usuário?</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Sim, excluir usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Redefinir senha
              </DialogTitle>
              <DialogDescription>
                Você está prestes a redefinir a senha deste usuário. Uma nova senha será gerada e enviada para o e-mail
                do usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">Tem certeza que deseja redefinir a senha deste usuário?</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" onClick={confirmResetPassword}>
                Sim, redefinir senha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return <Badge className="bg-upe-red hover:bg-upe-red/90">Administrador</Badge>
    case "coordenador":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Coordenador</Badge>
    case "cpa":
      return <Badge className="bg-upe-blue hover:bg-upe-blue/90">CPA</Badge>
    case "professor":
      return <Badge className="bg-green-500 hover:bg-green-600">Professor</Badge>
    case "aluno":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Aluno</Badge>
    case "tecnico":
      return <Badge className="bg-gray-500 hover:bg-gray-600">Técnico</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

// Dados de exemplo
const users = [
  {
    id: "user-1",
    name: "Maria Oliveira",
    email: "maria.oliveira@upe.br",
    role: "coordenador",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-2",
    name: "Carlos Santos",
    email: "carlos.santos@upe.br",
    role: "admin",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-3",
    name: "Ana Silva",
    email: "ana.silva@upe.br",
    role: "cpa",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-4",
    name: "Pedro Costa",
    email: "pedro.costa@upe.br",
    role: "admin",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-5",
    name: "Juliana Ferreira",
    email: "juliana.ferreira@upe.br",
    role: "professor",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-6",
    name: "Roberto Lima",
    email: "roberto.lima@upe.br",
    role: "professor",
    active: false,
    avatar: "/avatar.png",
  },
  {
    id: "user-7",
    name: "Fernanda Almeida",
    email: "fernanda.almeida@upe.br",
    role: "aluno",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-8",
    name: "Lucas Martins",
    email: "lucas.martins@upe.br",
    role: "aluno",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-9",
    name: "Mariana Souza",
    email: "mariana.souza@upe.br",
    role: "tecnico",
    active: true,
    avatar: "/avatar.png",
  },
  {
    id: "user-10",
    name: "José Pereira",
    email: "jose.pereira@upe.br",
    role: "tecnico",
    active: false,
    avatar: "/avatar.png",
  },
]
