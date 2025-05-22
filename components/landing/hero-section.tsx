"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="relative h-24 w-auto md:h-32">
          <Image src="/upe-logo.png" alt="Logo da UPE" width={200} height={80} className="object-contain" priority />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1] text-upe-blue"
      >
        Comissão Própria de Avaliação
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl md:text-2xl font-light text-upe-blue/80"
      >
        Universidade de Pernambuco
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
      >
        Contribua para o desenvolvimento da nossa universidade participando das avaliações institucionais. Sua opinião é
        fundamental para a melhoria contínua da UPE.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 mt-4"
      >
        <Link href={routes.auth.login}>
          <Button size="lg" className="gap-2 bg-upe-red hover:bg-upe-red/90">
            Participar da Avaliação <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.about}>
          <Button variant="outline" size="lg" className="border-upe-blue text-upe-blue hover:bg-upe-blue/10">
            Saiba Mais
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}
