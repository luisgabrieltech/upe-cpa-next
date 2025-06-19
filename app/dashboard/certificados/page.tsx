"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search } from "lucide-react"
import { useSession } from "next-auth/react"
import { getApiUrl } from "@/lib/api-utils"
import { routes } from "@/lib/routes"

interface Certificate {
  id: string
  formTitle: string
  completedAt: string
  downloadUrl: string
}

export default function CertificadosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const res = await fetch(getApiUrl("certificates"));
        if (res.ok) {
          const data = await res.json();
          setCertificates(data);
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error("Erro ao carregar certificados:", error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [session])

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.formTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Certificados</h1>
            <p className="text-muted-foreground">Gerencie e baixe seus certificados de conclusão</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar certificados..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                <h3 className="text-lg font-medium">Carregando certificados...</h3>
              </CardContent>
            </Card>
          ) : filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <h3 className="font-medium text-upe-blue">{certificate.formTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Concluído em: {new Date(certificate.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                          onClick={() => window.location.href = getApiUrl(`certificates/${certificate.id}/download`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Certificado
                        </Button>
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
                <h3 className="text-lg font-medium">Nenhum certificado encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você ainda não possui certificados ou nenhum corresponde à sua busca.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 