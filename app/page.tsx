import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/landing/hero-section"
import { AboutSection } from "@/components/landing/about-section"
import { ContactSection } from "@/components/landing/contact-section"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { routes } from "@/lib/routes"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <section id="benefits" className="container py-24 sm:py-32 bg-muted/30">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl text-upe-blue">
              Benefícios da Autoavaliação Institucional
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              A autoavaliação é um processo essencial para o desenvolvimento contínuo da nossa universidade.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-8 mt-12">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="relative overflow-hidden rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-upe-blue/10 text-upe-blue">
                  {benefit.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold">{benefit.title}</h3>
                <p className="mt-2 text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 flex justify-center">
            <Link href={routes.auth.login}>
              <Button size="lg" className="gap-2 bg-upe-red hover:bg-upe-red/90">
                Participar da Avaliação <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

const benefits = [
  {
    title: "Melhoria Contínua",
    description: "Identificação de pontos fortes e fracos para aprimoramento constante da instituição.",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  {
    title: "Transparência",
    description: "Promoção da transparência nos processos de gestão e tomada de decisões.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Qualidade Acadêmica",
    description: "Elevação dos padrões de qualidade do ensino, pesquisa e extensão.",
    icon: <School className="h-6 w-6" />,
  },
  {
    title: "Participação Coletiva",
    description: "Engajamento de toda a comunidade acadêmica no processo de desenvolvimento institucional.",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  {
    title: "Reconhecimento Externo",
    description: "Melhoria da imagem institucional perante órgãos reguladores e sociedade.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Cultura de Avaliação",
    description: "Estabelecimento de uma cultura permanente de autoavaliação e reflexão institucional.",
    icon: <School className="h-6 w-6" />,
  },
]
