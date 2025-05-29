"use client"

import { useState, useEffect } from "react"
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
import { getApiUrl, getImageUrl } from "@/lib/api-utils"

export default function AdminUsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")

  // Função para buscar usuários (fora do useEffect)
  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch(getApiUrl('user'))
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
    setResetPasswordSuccess(null)
    setResetPasswordError(null)
  }

  // Função para abrir o diálogo de perfil do usuário
  const handleViewProfile = (user: any) => {
    setSelectedUser(user)
    setIsProfileDialogOpen(true)
  }

  // Função para abrir o diálogo de definição de cargo
  const handleRoleClick = (user: any) => {
    setSelectedUser(user)
    setSelectedRole(user.role)
    setIsRoleDialogOpen(true)
    setRoleError(null)
  }

  // Função para confirmar a exclusão
  const confirmDelete = async () => {
    if (!selectedUserId) return
    try {
      const res = await fetch(getApiUrl(`user/${selectedUserId}`), {
        method: "DELETE",
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUserId))
        setIsDeleteDialogOpen(false)
        setSelectedUserId(null)
      } else {
        const data = await res.json()
        alert(data.message || "Erro ao excluir usuário.")
      }
    } catch (error) {
      alert("Erro ao excluir usuário.")
    }
  }

  // Função para confirmar a redefinição de senha
  const confirmResetPassword = async () => {
    if (!selectedUserId) return
    setResetPasswordLoading(true)
    setResetPasswordSuccess(null)
    setResetPasswordError(null)
    try {
      const res = await fetch(getApiUrl(`user/${selectedUserId}/reset-password`), {
        method: "POST",
      })
      const data = await res.json()
      if (res.ok) {
        setResetPasswordSuccess("E-mail de redefinição enviado com sucesso!")
      } else {
        setResetPasswordError(data.message || "Erro ao enviar e-mail de redefinição.")
      }
    } catch (error) {
      setResetPasswordError("Erro ao enviar e-mail de redefinição.")
    } finally {
      setResetPasswordLoading(false)
    }
  }

  // Função para ativar usuário
  const handleActivateUser = async (userId: string) => {
    setStatusLoading(userId)
    setStatusError(null)
    setStatusSuccess(null)
    try {
      const res = await fetch(getApiUrl(`user/${userId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      })
      if (res.ok) {
        setStatusSuccess("Usuário ativado com sucesso!")
        await fetchUsers() // Atualiza a lista após alteração
      } else {
        const data = await res.json()
        setStatusError(data.message || "Erro ao ativar usuário.")
      }
    } catch (error) {
      setStatusError("Erro ao ativar usuário.")
    } finally {
      setStatusLoading(null)
      setTimeout(() => setStatusSuccess(null), 2000)
    }
  }

  // Função para inativar usuário
  const handleDeactivateUser = async (userId: string) => {
    setStatusLoading(userId)
    setStatusError(null)
    setStatusSuccess(null)
    try {
      const res = await fetch(getApiUrl(`user/${userId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      })
      if (res.ok) {
        setStatusSuccess("Usuário inativado com sucesso!")
        await fetchUsers() // Atualiza a lista após alteração
      } else {
        const data = await res.json()
        setStatusError(data.message || "Erro ao inativar usuário.")
      }
    } catch (error) {
      setStatusError("Erro ao inativar usuário.")
    } finally {
      setStatusLoading(null)
      setTimeout(() => setStatusSuccess(null), 2000)
    }
  }

  // Função para confirmar alteração de cargo
  const confirmRoleChange = async () => {
    if (!selectedUser) return
    setRoleLoading(true)
    setRoleError(null)
    try {
      const res = await fetch(getApiUrl(`user/${selectedUser.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })
      if (res.ok) {
        await fetchUsers()
        setIsRoleDialogOpen(false)
      } else {
        const data = await res.json()
        setRoleError(data.message || "Erro ao alterar cargo.")
      }
    } catch (error) {
      setRoleError("Erro ao alterar cargo.")
    } finally {
      setRoleLoading(false)
    }
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
                                <AvatarImage src={getImageUrl("/placeholder.svg")} alt={user.name} />
                                <AvatarFallback className="bg-upe-blue text-white">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
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
                                <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Ver Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPasswordClick(user.id)}>
                                  <Key className="mr-2 h-4 w-4" />
                                  <span>Redefinir Senha</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleClick(user)}>
                                  <User className="mr-2 h-4 w-4 text-upe-blue" />
                                  <span>Definir Cargo</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.active ? (
                                  <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)} disabled={statusLoading === user.id}>
                                    <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                                    <span>Desativar Usuário</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleActivateUser(user.id)} disabled={statusLoading === user.id}>
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

        <Dialog open={isResetPasswordDialogOpen} onOpenChange={(open) => {
          setIsResetPasswordDialogOpen(open)
          if (!open) {
            setResetPasswordSuccess(null)
            setResetPasswordError(null)
            setResetPasswordLoading(false)
          }
        }}>
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
              {resetPasswordSuccess && (
                <div className="text-green-600 text-sm mt-2">{resetPasswordSuccess}</div>
              )}
              {resetPasswordError && (
                <div className="text-red-600 text-sm mt-2">{resetPasswordError}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)} disabled={resetPasswordLoading}>
                Cancelar
              </Button>
              <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" onClick={confirmResetPassword} disabled={resetPasswordLoading || !!resetPasswordSuccess}>
                {resetPasswordLoading ? "Enviando..." : resetPasswordSuccess ? "E-mail enviado" : "Sim, redefinir senha"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil do Usuário
              </DialogTitle>
              <DialogDescription>Visão detalhada do usuário selecionado</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                    <AvatarFallback className="bg-upe-blue text-white text-2xl">
                      {selectedUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg">{selectedUser.name}</div>
                    <div className="text-muted-foreground text-sm">{selectedUser.email}</div>
                    <RoleBadge role={selectedUser.role} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedUser.id}</div>
                  <div><span className="font-medium">Criado em:</span> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "-"}</div>
                  <div><span className="font-medium">Atualizado em:</span> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : "-"}</div>
                </div>
                {selectedUser.extraData && (
                  <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2 mt-2">
                    {selectedUser.extraData.course && (
                      <div><span className="font-medium">Curso:</span> {selectedUser.extraData.course}</div>
                    )}
                    {selectedUser.extraData.campus && (
                      <div><span className="font-medium">Campus:</span> {selectedUser.extraData.campus}</div>
                    )}
                    {selectedUser.extraData.registration && (
                      <div><span className="font-medium">Matrícula:</span> {selectedUser.extraData.registration}</div>
                    )}
                    {selectedUser.extraData.phone && (
                      <div><span className="font-medium">Telefone:</span> {selectedUser.extraData.phone}</div>
                    )}
                  </div>
                )}
                {/* Respostas e formulários respondidos */}
                {selectedUser.responses && selectedUser.responses.length > 0 && (
                  <div className="mt-4 border-t pt-2">
                    <div className="font-semibold mb-2">Formulários Respondidos</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Object.entries(
                        selectedUser.responses.reduce((acc: any, resp: any) => {
                          const formId = resp.form.id
                          if (!acc[formId]) acc[formId] = { title: resp.form.title, responses: [] }
                          acc[formId].responses.push(resp)
                          return acc
                        }, {})
                      ).map(([formId, data]: any) => (
                        <div key={formId} className="border rounded p-2">
                          <div className="font-medium text-upe-blue">{data.title}</div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {data.responses.length} resposta(s) - Última: {new Date(data.responses[data.responses.length-1].createdAt).toLocaleString()}
                          </div>
                          <ul className="text-xs pl-4 list-disc">
                            {data.responses.map((resp: any) => (
                              <li key={resp.id}>
                                <span className="font-medium">{resp.question.text}:</span> {resp.value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Feedback visual para ativação/inativação */}
                {statusSuccess && <div className="text-green-600 text-sm text-center mt-2">{statusSuccess}</div>}
                {statusError && <div className="text-red-600 text-sm text-center mt-2">{statusError}</div>}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Definir Cargo</DialogTitle>
              <DialogDescription>Escolha o novo cargo para o usuário <b>{selectedUser?.name}</b>.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="USER">Usuário</SelectItem>
                </SelectContent>
              </Select>
              {roleError && <div className="text-red-600 text-sm">{roleError}</div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={roleLoading}>
                Cancelar
              </Button>
              <Button className="bg-upe-blue text-white" onClick={confirmRoleChange} disabled={roleLoading}>
                {roleLoading ? "Salvando..." : "Salvar"}
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
