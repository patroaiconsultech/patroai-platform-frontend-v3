/**
 * Design reminder — V3.7 public landing: cinematic portal, tactile core and
 * low-friction orbital navigation. Gold carries the brand signal; cyan/violet
 * provide depth. Motion is opt-in, concise and reduced-motion safe.
 */
import { useEffect, useRef, useState } from "react";

type V37ImmersiveProps = {
  onPrivateAccess: () => void | Promise<void>;
};

type Stage = "gate" | "lobby" | "content";

const nodes = [
  ["01", "Cocriação", "#cocriacao"],
  ["02", "Governança", "#governanca"],
  ["03", "ESG", "#governanca"],
  ["04", "ROI", "#metodo"],
  ["05", "Ecossistema", "#ecossistema"],
  ["06", "Contato", "#contato"],
] as const;

export function V37Immersive({ onPrivateAccess }: V37ImmersiveProps) {
  const [stage, setStage] = useState<Stage>("gate");
  const [playing, setPlaying] = useState(false);
  const coreRef = useRef<HTMLButtonElement>(null);

  const audio = () => document.getElementById("patroaiImmersiveAudio") as HTMLAudioElement | null;

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("v37-immersive-open", stage !== "content");
    return () => body.classList.remove("v37-immersive-open");
  }, [stage]);

  const enter = async (withSound: boolean) => {
    if (withSound) {
      try {
        await audio()?.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
    setStage("lobby");
  };

  const goTo = (target: string) => {
    setStage("content");
    window.setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const toggleAudio = async () => {
    const track = audio();
    if (!track) return;
    if (track.paused) {
      try { await track.play(); setPlaying(true); } catch { setPlaying(false); }
    } else {
      track.pause();
      setPlaying(false);
    }
  };

  if (stage === "content") return null;

  return (
    <section className={`v37-immersive v37-immersive--${stage}`} aria-label="Experiência imersiva PatroAI">
      <div className="v37-immersive__starfield" aria-hidden="true" />
      {stage === "gate" ? (
        <div className="v37-gate" role="dialog" aria-modal="true" aria-labelledby="v37-title">
          <div className="v37-gate__portal" aria-hidden="true">
            <div className="v37-gate__rings" />
            <img src="/assets/patroai-perspective-preview.png" alt="" />
          </div>
          <div className="v37-gate__copy">
            <img className="v37-gate__logo" src="/assets/patroai-logo-integrated.png" alt="PatroAI" />
            <p>PATROAI · EXPERIÊNCIA IMERSIVA</p>
            <h1 id="v37-title">Entre pelo núcleo.</h1>
            <span>Uma experiência viva de inteligência, presença, som e movimento. Escolha como deseja iniciar.</span>
            <button className="v37-primary" type="button" onClick={() => void enter(true)}><b>◉ Entrar com som</b><small>Ativar a trilha e entrar no núcleo imersivo</small></button>
            <button className="v37-secondary" type="button" onClick={() => void enter(false)}>Entrar sem som</button>
            <button className="v37-text" type="button" onClick={() => setStage("content")}>Ir para apresentação</button>
          </div>
        </div>
      ) : (
        <div className="v37-lobby">
          <header><span>PATROAI · NÚCLEO IMERSIVO</span><button type="button" onClick={() => setStage("content")}>Ir para apresentação</button></header>
          <div className="v37-lobby__orbit" aria-hidden="true"><i /><i /><i /></div>
          <button
            ref={coreRef}
            className="v37-core"
            type="button"
            aria-label="Núcleo PatroAI: arraste para explorar"
            onPointerMove={(event) => {
              if (event.buttons !== 1) return;
              const x = Math.max(-26, Math.min(26, event.movementX));
              const y = Math.max(-26, Math.min(26, event.movementY));
              coreRef.current?.style.setProperty("--drag", `translate(${x}px, ${y}px)`);
            }}
            onPointerUp={() => coreRef.current?.style.setProperty("--drag", "translate(0, 0)")}
          ><img src="/assets/patroai-logo-integrated.png" alt="" /></button>
          <h2>Escolha por onde deseja entrar.</h2>
          <p>O núcleo permanece vivo enquanto você navega.</p>
          <nav aria-label="Rotas da experiência imersiva">
            {nodes.map(([index, label, target]) => <button key={label} type="button" onClick={() => goTo(target)}><em>{index}</em>{label}</button>)}
          </nav>
          <button className="v37-access" type="button" onClick={() => void onPrivateAccess()}>Acessar Plataforma</button>
          <div className="v37-dock" aria-label="Controle da experiência sonora"><button type="button" onClick={() => void toggleAudio()} aria-label={playing ? "Pausar música" : "Reproduzir música"}>{playing ? "Ⅱ" : "▶"}</button><span>FAIXA IMERSIVA</span><button type="button" onClick={() => { const track = audio(); if (track) track.muted = !track.muted; }} aria-label="Alternar mudo">♪</button></div>
        </div>
      )}
    </section>
  );
}
