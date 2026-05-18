import type { Metadata } from "next";
import Image from "next/image";
import { Teko, Inter } from "next/font/google";

const teko = Teko({ subsets: ["latin"], variable: "--font-teko" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PQ Fighters - Grappling & Jiu-Jitsu",
  description:
    "Disciplina. Evolucao. Proposito. Centro de treinamento de Jiu-Jitsu e Grappling em Porto Alegre.",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="PQ Fighters" width={36} height={36} />
          <span className="font-teko text-2xl font-bold uppercase tracking-tight text-white">
            PQ <span className="text-accent">Fighters</span>
          </span>
        </a>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
          <a
            href="/patrick-quadros"
            className="hidden sm:block text-zinc-400 hover:text-white transition-colors"
          >
            Patrick Quadros
          </a>
          <a
            href="https://app.pqfighters.com.br/login"
            className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            Area do Aluno
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="PQ Fighters" width={28} height={28} />
            <span className="font-teko text-xl font-bold uppercase text-white">
              PQ <span className="text-accent">Fighters</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a
              href="https://www.instagram.com/pq.fighters"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://wa.me/5551985092214"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <p className="text-center text-zinc-600 text-xs mt-8">
          &copy; {new Date().getFullYear()} PQ Fighters. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${teko.variable} ${inter.variable} font-inter min-h-screen flex flex-col bg-[#111111] text-zinc-300`}
    >
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
