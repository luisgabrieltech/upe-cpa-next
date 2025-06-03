"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, School, Building, Bell, Shield, Lock, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getApiUrl, getImageUrl } from "@/lib/api-utils"

export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [userData, setUserData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    extraData: {
      course: "",
      campus: "",
      registration: "",
      phone: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(getApiUrl('user/profile'))
        if (response.ok) {
          const data = await response.json()
          setUserData((prev) => ({
            ...prev,
            name: data.name,
            email: data.email,
            extraData: data.extraData || {
              course: "",
              campus: "",
              registration: "",
              phone: "",
            },
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do perfil",
          variant: "destructive",
        })
      }
    }

    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl('user/profile'), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          extraData: userData.extraData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso",
        })
        setIsEditing(false)
      } else {
        throw new Error("Erro ao atualizar perfil")
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-upe-blue">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
              disabled
            >
              Notificações
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
              disabled
            >
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={getImageUrl("/avatar.png")} alt="Avatar" />
                        <AvatarFallback className="bg-upe-blue text-white text-xl">
                          {userData.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-upe-blue text-upe-blue hover:bg-upe-blue/10"
                        disabled={!isEditing}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Alterar foto
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-upe-blue" />
                            Nome completo
                          </Label>
                          <Input
                            id="name"
                            value={userData.name || ""}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-upe-blue" />
                            E-mail institucional
                          </Label>
                          <Input id="email" value={userData.email || ""} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course" className="flex items-center gap-2">
                            <School className="h-4 w-4 text-upe-blue" />
                            Curso
                          </Label>
                          <Select
                            disabled={!isEditing}
                            value={userData.extraData.course || ""}
                            onValueChange={(value) =>
                              setUserData({
                                ...userData,
                                extraData: { ...userData.extraData, course: value },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu curso" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ciência da Computação">Ciência da Computação</SelectItem>
                              <SelectItem value="Engenharia de Software">Engenharia de Software</SelectItem>
                              <SelectItem value="Sistemas de Informação">Sistemas de Informação</SelectItem>
                              <SelectItem value="Licenciatura em Computação">Licenciatura em Computação</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="campus" className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-upe-blue" />
                            Campus
                          </Label>
                          <Select
                            disabled={!isEditing}
                            value={userData.extraData.campus || ""}
                            onValueChange={(value) =>
                              setUserData({
                                ...userData,
                                extraData: { ...userData.extraData, campus: value },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu campus" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Campus Garanhuns">Campus Garanhuns</SelectItem>
                              <SelectItem value="Campus Petrolina">Campus Petrolina</SelectItem>
                              <SelectItem value="Campus Recife">Campus Recife</SelectItem>
                              <SelectItem value="Campus Caruaru">Campus Caruaru</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registration" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-upe-blue" />
                            Matrícula
                          </Label>
                          <Input
                            id="registration"
                            value={userData.extraData.registration || ""}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                extraData: { ...userData.extraData, registration: e.target.value },
                              })
                            }
                            disabled={!isEditing}
                            placeholder="Digite sua matrícula"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-upe-blue" />
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            value={userData.extraData.phone || ""}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                extraData: { ...userData.extraData, phone: e.target.value },
                              })
                            }
                            disabled={!isEditing}
                            placeholder="(xx) xxxxx-xxxx"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-upe-blue text-upe-blue hover:bg-upe-blue/10"
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                      >
                        Editar perfil
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Funcionalidade em desenvolvimento...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Funcionalidade em desenvolvimento...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
