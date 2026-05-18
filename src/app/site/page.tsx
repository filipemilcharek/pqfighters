import Image from "next/image";

const FILOSOFIA = [
  {
    num: "01",
    nome: "Simplicidade que funciona",
    desc: "Ensinamos menos para que voce entenda mais e aplique melhor. O simples bem feito vence o complexo mal feito.",
  },
  {
    num: "02",
    nome: "Repeticao com proposito",
    desc: "A repeticao cria memoria muscular, confianca e precisao. Cada repeticao tem intencao e constroi um Jiu-Jitsu solido.",
  },
  {
    num: "03",
    nome: "Eficiencia na pratica",
    desc: "Valorizamos o tempo no tatame. Cada treino e planejado para gerar evolucao real, com maximo aprendizado.",
  },
  {
    num: "04",
    nome: "Mente forte, Jiu-Jitsu forte",
    desc: "Controle emocional, disciplina e foco sao tao importantes quanto tecnica e forca.",
  },
  {
    num: "05",
    nome: "Evolucao sempre",
    desc: "Nunca paramos no que ja sabemos. Nosso compromisso e com a sua melhor versao, dentro e fora do tatame.",
  },
];

const PRINCIPIOS = [
  { nome: "Objetividade", desc: "Tecnicas com proposito claro e aplicabilidade real." },
  { nome: "Progressao", desc: "Do basico ao avancado, respeitando o tempo e a base de cada um." },
  { nome: "Eficiencia", desc: "Economia de energia e movimentos que geram maximo resultado." },
  { nome: "Adaptabilidade", desc: "Entender para se adaptar a qualquer oponente e situacao." },
  { nome: "Inteligencia", desc: "Mais que forca: tomar boas decisoes e o que define o resultado." },
  { nome: "Disciplina", desc: "Constancia, foco e mentalidade sao tao importantes quanto a tecnica." },
];

const ESTRUTURA_AULA = [
  { nome: "Aquecimento", min: 10, desc: "Preparacao fisica especifica, mobilidade e prevencao de lesoes." },
  { nome: "Tecnica", min: 20, desc: "Ensino detalhado com demonstracao e pontos-chave." },
  { nome: "Drills", min: 15, desc: "Exercicios para fixacao, timing e precisao." },
  { nome: "Sparring", min: 10, desc: "Aplicacao em situacoes reais de luta." },
  { nome: "Fechamento", min: 5, desc: "Alongamento e revisao." },
];

const VALORES = [
  { nome: "Uniao", desc: "Juntos somos mais fortes. Aqui, ninguem treina sozinho." },
  { nome: "Respeito", desc: "Dentro e fora do tatame, tratamos todos com honra e humildade." },
  { nome: "Disciplina", desc: "Fazemos o certo, mesmo quando ninguem ve." },
  { nome: "Foco", desc: "Mente no objetivo. Cada treino e um passo em direcao a nossa melhor versao." },
  { nome: "Compromisso", desc: "Prometemos, fazemos e entregamos." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/site/patrick-victory.jpg"
          alt="PQ Fighters"
          fill
          className="object-cover object-top brightness-[0.3] grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-transparent to-[#111111]" />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <Image
            src="/logo.png"
            alt="PQ Fighters"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
          <h1 className="font-teko text-5xl sm:text-7xl md:text-8xl font-bold uppercase leading-[0.9] text-white">
            PQ <span className="text-accent">Fighters</span>
          </h1>
          <p className="font-teko text-xl sm:text-2xl uppercase tracking-[0.3em] text-zinc-400 mt-3">
            Grappling & Jiu-Jitsu
          </p>
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mt-6">
            Disciplina. Evolucao. Proposito.
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
              href="/patrick-quadros"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-8 py-3 rounded-md font-semibold transition-colors text-sm uppercase tracking-wider"
            >
              Conheca o Professor
            </a>
          </div>
        </div>
      </section>

      {/* Filosofia */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            01 — Filosofia
          </p>
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
            Filosofia do Metodo
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl text-lg leading-relaxed">
            O metodo do PQ Fighters e baseado na simplicidade, eficiencia e
            repeticao inteligente. Ensinamos o que realmente funciona, eliminando
            o excesso e valorizando a essencia do Jiu-Jitsu.
          </p>
          <div className="mt-12 space-y-0">
            {FILOSOFIA.map((item) => (
              <div
                key={item.num}
                className="flex gap-5 py-6 border-b border-white/5 group"
              >
                <span className="font-teko text-3xl sm:text-4xl font-bold text-accent/30 group-hover:text-accent transition-colors italic leading-none pt-1">
                  {item.num}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {item.nome}
                  </h3>
                  <p className="text-zinc-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 italic mt-8 text-sm">
            &ldquo;Nossa filosofia e transformar conhecimento em resultado e
            disciplina em carater.&rdquo;
          </p>
        </div>
      </section>

      {/* Principios */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            02 — Sistema
          </p>
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
            Sistema Progressivo
          </h2>
          <p className="font-teko text-xl text-zinc-500 uppercase tracking-wider mt-1">
            White Monkey
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {PRINCIPIOS.map((p) => (
              <div
                key={p.nome}
                className="border border-white/5 rounded-lg p-6 hover:border-accent/20 transition-colors"
              >
                <h3 className="text-white font-semibold">{p.nome}</h3>
                <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 italic mt-10 text-sm">
            &ldquo;Tecnica sem estrategia e movimento. Estrategia sem tecnica e
            intencao. A uniao dos dois transforma intencao em vitoria.&rdquo;
          </p>
        </div>
      </section>

      {/* Foto break */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/site/patrick-mma-3.jpg"
          alt="PQ Fighters em acao"
          fill
          className="object-cover object-center brightness-[0.25] grayscale"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="font-teko text-2xl sm:text-4xl font-bold uppercase text-white text-center px-4 leading-snug max-w-2xl">
            O simples bem feito{" "}
            <span className="text-accent">vence</span> o complexo mal feito
          </blockquote>
        </div>
      </section>

      {/* Estrutura das Aulas */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            03 — Treinos
          </p>
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
            Estrutura das Aulas
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl">
            60 minutos planejados para oferecer o melhor aprendizado de forma
            organizada, dinamica e eficiente.
          </p>
          <div className="mt-12 flex flex-col gap-4">
            {ESTRUTURA_AULA.map((etapa, i) => (
              <div
                key={etapa.nome}
                className="flex items-start gap-4 sm:gap-6"
              >
                <div className="w-16 sm:w-20 shrink-0 text-right">
                  <span className="font-teko text-2xl sm:text-3xl font-bold text-accent">
                    {etapa.min}&apos;
                  </span>
                </div>
                <div
                  className="flex-1 border-l border-white/10 pl-4 sm:pl-6 pb-4"
                  style={{
                    borderColor:
                      i === ESTRUTURA_AULA.length - 1
                        ? "transparent"
                        : undefined,
                  }}
                >
                  <h3 className="text-white font-semibold">{etapa.nome}</h3>
                  <p className="text-zinc-500 text-sm mt-1">{etapa.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultura */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <p className="font-teko text-accent text-lg uppercase tracking-widest mb-2">
            04 — Cultura
          </p>
          <h2 className="font-teko text-4xl sm:text-5xl font-bold uppercase text-white leading-tight">
            Cultura da Equipe
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl leading-relaxed">
            Somos uma familia que cresce junto, se apoia e se desafia todos os
            dias. Nossos valores guiam nossas atitudes dentro e fora dos
            tatames.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px mt-12 bg-white/5 rounded-lg overflow-hidden">
            {VALORES.map((v) => (
              <div key={v.nome} className="bg-[#0d0d0d] p-6">
                <h3 className="font-teko text-2xl font-bold uppercase text-white">
                  {v.nome}
                </h3>
                <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 italic mt-10 text-sm">
            &ldquo;Vestimos essa camisa com orgulho e representamos o PQ
            Fighters em tudo que fazemos.&rdquo;
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <Image
          src="/site/patrick-adcc.jpg"
          alt="PQ Fighters"
          fill
          className="object-cover brightness-[0.15] grayscale"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-teko text-4xl sm:text-6xl font-bold uppercase text-white leading-tight">
            Pronto para <span className="text-accent">evoluir</span>?
          </h2>
          <p className="text-zinc-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Faca parte do PQ Fighters. Disciplina, tecnica e mentalidade para
            sua melhor versao dentro e fora do tatame.
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
              href="/patrick-quadros"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-8 py-3 rounded-md font-semibold transition-colors text-sm uppercase tracking-wider"
            >
              Conheca o Professor
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
