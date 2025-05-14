"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import NovoFormularioPage from "../page"

export default function EditarFormularioPage() {
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true)
      const res = await fetch(`/api/forms?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setFormData(data)
      }
      setLoading(false)
    }
    if (id) fetchForm()
  }, [id])

  if (loading) return <div className="p-8 text-center">Carregando formulário...</div>
  if (!formData) return <div className="p-8 text-center text-red-600">Formulário não encontrado.</div>

  return <NovoFormularioPage initialData={formData} />
} 