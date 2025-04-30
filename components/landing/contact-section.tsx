"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { AtSign, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="contact" className="container py-24 sm:py-32">
      <div ref={ref} className="grid gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-upe-blue">
            Entre em Contato
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Tem dúvidas sobre a CPA ou o processo de autoavaliação? Entre em contato conosco.
          </p>
          <div className="mt-8 space-y-6">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-upe-blue/10 text-upe-blue">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input id="name" placeholder="Nome" />
                </div>
                <div className="space-y-2">
                  <Input id="email" type="email" placeholder="Email" />
                </div>
              </div>
              <div className="space-y-2">
                <Input id="subject" placeholder="Assunto" />
              </div>
              <div className="space-y-2">
                <Textarea id="message" placeholder="Mensagem" className="min-h-[150px] resize-none" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-upe-red hover:bg-upe-red/90">
              Enviar Mensagem
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

const contactInfo = [
  {
    title: "Email",
    details: "cpa@upe.br",
    icon: <AtSign className="h-5 w-5" />,
  },
  {
    title: "Telefone",
    details: "(81) 3183-3000",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    title: "Endereço",
    details: "Av. Agamenon Magalhães, s/n - Santo Amaro, Recife - PE, 50100-010",
    icon: <MapPin className="h-5 w-5" />,
  },
]
