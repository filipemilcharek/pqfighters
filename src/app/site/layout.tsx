import type { Metadata } from "next";
import Image from "next/image";
import { Teko, Inter } from "next/font/google";

const teko = Teko({ subsets: ["latin"], variable: "--font-teko" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "faixappreta - Sistema de Gestão para CTs e Academias",
  description:
    "A solução completa para gerir seu CT. Controle de alunos, graduações e agendamentos.",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          {/* Logo baseada em texto para evitar referências a outros projetos */}
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-teko text-2xl font-bold text-white">FP</div>
          <span className="font-teko text-3xl font-bold uppercase tracking-tight text-white">
            faix<span className="text-red-600">app</span>reta
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
          <a href="#funcionalidades" className="text-zinc-400 hover:text-white transition-colors">Funcionalidades</a>
          <a href="#planos" className="text-zinc-400 hover:text-white transition-colors">Planos</a>
          <a href="#contato" className="text-zinc-400 hover:text-white transition-colors">Contato</a>
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="https://app.faixappreta.com.br/login"
            className="text-white border border-white/20 hover:bg-white/10 px-6 py-2 rounded-full text-sm font-semibold transition-all uppercase tracking-wider"
          >
            Entrar
          </a>
          <a
            href="#contato"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all uppercase tracking-wider shadow-lg shadow-red-600/20"
          >
            Começar Agora
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-teko text-2xl font-bold text-white">FP</div>
              <span className="font-teko text-3xl font-bold uppercase tracking-tight text-white">
                faix<span className="text-red-600">app</span>reta
              </span>
            </a>
            <p className="text-zinc-500 max-w-sm leading-relaxed mb-8">
              A plataforma definitiva para gestão de centros de treinamento, artes marciais e academias. Do tatame para o digital.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-widest text-sm mb-6">Produto</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="https://app.faixappreta.com.br" className="hover:text-white transition-colors">Login do Aluno</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-widest text-sm mb-6">Suporte</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#contato" className="hover:text-white transition-colors">Fale Conosco</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} faixappreta. Todos os direitos reservados.
          </p>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Feito para quem vive o tatame.
          </p>
        </div>
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
      className={`${teko.variable} ${inter.variable} font-inter min-h-screen flex flex-col bg-[#050505] text-zinc-300`}
    >
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
