"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function VotacoesPage() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-upe-blue">Votações</h1>
          <p className="text-muted-foreground">Participe das votações da CPA-UPE</p>
        </div>

        <Card className="border-upe-blue/20">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-upe-red mb-4" />
            <h3 className="text-xl font-medium text-upe-blue mb-2">Votações Desativadas</h3>
            <div className="flex items-center gap-2 mb-4 text-upe-red">
              <AlertTriangle className="h-4 w-4" />
              <p className="font-medium">Temporariamente indisponível</p>
            </div>
            <p className="text-muted-foreground max-w-md">
              As votações estão temporariamente desativadas. Aguarde novas instruções da CPA. Esta funcionalidade será
              habilitada em breve para permitir a participação em processos decisórios da universidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
