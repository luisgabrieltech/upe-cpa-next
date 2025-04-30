"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { ClipboardCheck, LineChart, Users } from "lucide-react"

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="about" className="container py-24 sm:py-32 bg-upe-blue/5">
      <div ref={ref} className="grid gap-10 md:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-upe-blue">O que é a CPA?</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            A Comissão Própria de Avaliação (CPA) é responsável por coordenar os processos de avaliação interna da
            Universidade de Pernambuco, bem como sistematizar e prestar informações solicitadas pelos órgãos de
            regulação da educação superior.
          </p>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Instituída pela Lei nº 10.861/2004, que criou o Sistema Nacional de Avaliação da Educação Superior (SINAES),
            a CPA tem como principal objetivo promover a melhoria da qualidade da educação superior, a orientação da
            expansão da sua oferta, o aumento permanente da sua eficácia institucional e efetividade acadêmica e social.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 gap-6"
        >
          {aboutItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-start rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-upe-blue/10 text-upe-blue">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const aboutItems = [
  {
    title: "Autoavaliação Institucional",
    description:
      "Coordenação dos processos internos de avaliação da universidade, sistematização e divulgação de informações.",
    icon: <ClipboardCheck className="h-6 w-6" />,
  },
  {
    title: "Análise de Dados",
    description: "Coleta e análise de dados qualitativos e quantitativos para subsidiar o planejamento institucional.",
    icon: <LineChart className="h-6 w-6" />,
  },
  {
    title: "Participação Comunitária",
    description: "Promoção da participação de todos os segmentos da comunidade acadêmica no processo avaliativo.",
    icon: <Users className="h-6 w-6" />,
  },
]
