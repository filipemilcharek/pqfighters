import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Patrick Quadros — PQ Fighters",
  description:
    "Patrick de Quadros Jayme, o White Monkey. Atleta profissional de MMA, grappler e professor de Jiu-Jitsu.",
};

const CONQUISTAS = [
  {
    titulo: "Campeão Meio-Pesado IFL",
    desc: "Cinturão meio-pesado do Inside Fighters League, vitória por TKO.",
  },
  {
    titulo: "LFA 132",
    desc: "Participação no Legacy Fighting Alliance, uma das maiores organizações formadoras de talentos para o UFC.",
  },
  {
    titulo: "FFC 51",
    desc: "Representou o Brasil no Fusion Fighting Championship em evento internacional.",
  },
  {
    titulo: "ADCC South American Trials",
    desc: "Participação nas seletivas sul-americanas do ADCC 2022.",
  },
];

const STATS = [
  { label: "Vitórias", value: "12", detail: "5 KO/TKO • 4 Sub • 2 Dec" },
  { label: "Altura", value: "1.88m", detail: "Meio-Pesado (93kg)" },
  { label: "Modalidades", value: "4", detail: "MMA • BJJ • Grappling • No-Gi" },
];

const GALERIA = [
  { src: "/site/patrick-mma-4.jpg", alt: "Patrick no MMA - controle" },
  { src: "/site/patrick-mma-5.jpg", alt: "Patrick no MMA - finalização" },
  { src: "/site/patrick-grappling-1.jpg", alt: "Patrick no Grappling" },
  { src: "/site/patrick-grappling-2.jpg", alt: "Patrick em clinch" },
  { src: "/site/patrick-mma-2.jpg", alt: "Patrick no MMA - cage" },
  { src: "/site/patrick-adcc.jpg", alt: "Patrick no ADCC" },
];

export default function PatrickQuadrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-end overflow-hidden">
        <Image
          src="/site/patrick-lfa.jpg"
          alt="Patrick Quadros no LFA"
          fill
          className="object-cover object-top brightness-[0.5] grayscale contrast-125"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            White Monkey
          </p>
          <h1 className="font-teko text-5xl sm:text-7xl md:text-8xl font-bold uppercase leading-[0.9] text-white">
            Patrick
            <br />
            <span className="text-accent">Quadros</span>
          </h1>
          <p className="text-zinc-400 mt-4 max-w-xl text-lg leading-relaxed">
            Atleta profissional de MMA, grappler e professor de Jiu-Jitsu.
            Porto Alegre, RS.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-3 gap-4 sm:gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-teko text-3xl sm:text-4xl font-bold text-accent">
                {s.value}
              </p>
              <p className="text-white font-semibold text-sm mt-1">
                {s.label}
              </p>
              <p className="text-zinc-600 text-xs mt-0.5 hidden sm:block">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bio */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
              Sobre
            </p>
            <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
              O Atleta
            </h2>
            <div className="text-zinc-400 mt-6 space-y-4 leading-relaxed">
              <p>
                Patrick de Quadros Jayme, conhecido como &ldquo;White
                Monkey&rdquo;, é atleta profissional de MMA, grappler e
                competidor de Jiu-Jitsu com trajetória consolidada no cenário
                nacional e internacional das artes marciais.
              </p>
              <p>
                Com experiência em organizações reconhecidas como Legacy
                Fighting Alliance, Fusion Fighting Championship e Taura MMA,
                desenvolveu carreira marcada pela agressividade, pressão física
                e forte base de grappling.
              </p>
              <p>
                Além do MMA, também atuou em competições de alto nível no
                Jiu-Jitsu e Grappling, incluindo participação nas seletivas
                sul-americanas do ADCC e torneios da IBJJF.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">
              Características técnicas
            </p>
            {[
              "Forte pressão física",
              "Alto volume ofensivo",
              "Base sólida de Jiu-Jitsu e grappling",
              "Eficiência em finalizações",
              "Resistência física e experiência competitiva",
              "Versatilidade entre striking e luta de solo",
            ].map((c) => (
              <div
                key={c}
                className="flex items-center gap-3 py-3 border-b border-white/5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-zinc-300 text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conquistas */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            Carreira
          </p>
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
            Destaques & Conquistas
          </h2>
          <div className="mt-12 space-y-0">
            {CONQUISTAS.map((c, i) => (
              <div
                key={c.titulo}
                className="flex gap-5 py-6 border-b border-white/5 group"
              >
                <span className="font-teko text-3xl sm:text-4xl font-bold text-accent/30 group-hover:text-accent transition-colors italic leading-none pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {c.titulo}
                  </h3>
                  <p className="text-zinc-500 mt-1 leading-relaxed text-sm">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-3">
              Principais organizações
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "LFA",
                "FFC",
                "Taura MMA",
                "Aspera FC",
                "Brazilian Fighting Series",
                "IFL",
                "ADCC",
                "IBJJF",
              ].map((org) => (
                <span
                  key={org}
                  className="text-xs text-zinc-500 border border-white/5 rounded px-3 py-1.5"
                >
                  {org}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            Galeria
          </p>
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight mb-12">
            Em Ação
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {GALERIA.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] overflow-hidden rounded-md group"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
            Treine com o <span className="text-accent">Patrick</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Aulas de Jiu-Jitsu, Grappling e No-Gi com metodologia própria.
            Venha conhecer o PQ Fighters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a
              href="https://wa.me/5551985092214?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20aula%20experimental!"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-md font-semibold transition-colors text-sm uppercase tracking-wider"
            >
              Agende Sua Aula Experimental
            </a>
            <a
              href="/"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-8 py-3 rounded-md font-semibold transition-colors text-sm uppercase tracking-wider"
            >
              Sobre o CT
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
