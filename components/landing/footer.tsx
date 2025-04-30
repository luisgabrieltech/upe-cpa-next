import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-upe-blue text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/upe-logo-white.png" alt="Logo UPE" width={120} height={48} className="h-12 w-auto" />
            </Link>
            <p className="text-sm text-white/80">Comissão Própria de Avaliação da Universidade de Pernambuco</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white/80 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-white/80 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-white/80 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-white/80 hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Sobre a UPE
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Sobre a CPA
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Legislação
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Relatórios
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Avaliação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Formulários
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Resultados
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Cronograma
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://www.upe.br" target="_blank" className="text-white/80 hover:text-white">
                  Portal UPE
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Ouvidoria
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Transparência
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-6">
          <p className="text-center text-sm text-white/80">
            &copy; {new Date().getFullYear()} Universidade de Pernambuco. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
