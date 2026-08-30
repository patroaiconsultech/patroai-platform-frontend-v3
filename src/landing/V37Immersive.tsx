/**
 * PatroAI immersive landing V3.7.1 — Fluid Starfield Restore.
 *
 * The lobby is deliberately starfield-only: no decorative orbit/ring geometry.
 * The core video dissolves into the environment and remains mounted while the
 * exit transition completes, so navigation never hard-cuts from the nucleus to
 * the institutional presentation.
 */
import { useEffect, useRef, useState } from "react";

type V37ImmersiveProps = {
  onPrivateAccess: () => void | Promise<void>;
};

type Stage = "lobby" | "exiting" | "content";

const EXIT_DURATION_MS = 820;
const PRIVATE_EXIT_DURATION_MS = 560;

const nodes = [
  ["01", "Cocriação", "#cocriacao"],
  ["02", "Governança", "#governanca"],
  ["03", "ESG", "#governanca"],
  ["04", "ROI", "#metodo"],
  ["05", "Ecossistema", "#ecossistema"],
  ["06", "Contato", "#contato"],
] as const;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function V37Immersive({ onPrivateAccess }: V37ImmersiveProps) {
  const [stage, setStage] = useState<Stage>("lobby");
  const [playing, setPlaying] = useState(false);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const audio = () =>
    document.getElementById("patroaiImmersiveAudio") as HTMLAudioElement | null;

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("v37-immersive-open", stage !== "content");

    return () => {
      body.classList.remove("v37-immersive-open");
    };
  }, [stage]);

  useEffect(
    () => () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    },
    [],
  );

  const finishContentExit = (target: string) => {
    setStage("content");
    window.requestAnimationFrame(() => {
      document.querySelector(target)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const exitTo = (target: string) => {
    if (stage !== "lobby") return;

    if (prefersReducedMotion()) {
      finishContentExit(target);
      return;
    }

    setStage("exiting");
    exitTimerRef.current = window.setTimeout(
      () => finishContentExit(target),
      EXIT_DURATION_MS,
    );
  };

  const enterPrivateAccess = () => {
    if (stage !== "lobby") return;

    if (prefersReducedMotion()) {
      void onPrivateAccess();
      return;
    }

    setStage("exiting");
    exitTimerRef.current = window.setTimeout(
      () => void onPrivateAccess(),
      PRIVATE_EXIT_DURATION_MS,
    );
  };

  const toggleAudio = async () => {
    const track = audio();
    if (!track) return;

    if (track.paused) {
      try {
        await track.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    track.pause();
    setPlaying(false);
  };

  if (stage === "content") return null;

  return (
    <section
      className={`v37-immersive v37-immersive--${stage}`}
      data-audio-active={playing ? "true" : "false"}
      aria-label="Experiência imersiva PatroAI"
    >
      <div className="v37-atmosphere" aria-hidden="true" />
      <div className="v37-stars v37-stars--base" aria-hidden="true" />
      <div className="v37-stars v37-stars--low" aria-hidden="true" />
      <div className="v37-stars v37-stars--mid" aria-hidden="true" />
      <div className="v37-stars v37-stars--high" aria-hidden="true" />

      <div
        className="v37-lobby"
        onPointerMove={(event) => {
          if (prefersReducedMotion()) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          coreRef.current?.style.setProperty("--core-x", `${(x * 8).toFixed(2)}px`);
          coreRef.current?.style.setProperty("--core-y", `${(y * 6).toFixed(2)}px`);
        }}
        onPointerLeave={() => {
          coreRef.current?.style.setProperty("--core-x", "0px");
          coreRef.current?.style.setProperty("--core-y", "0px");
        }}
      >
        <header className="v37-lobby__header">
          <span>PATROAI · NÚCLEO IMERSIVO</span>
          <button type="button" onClick={() => exitTo("#top")}>
            Ir para apresentação
          </button>
        </header>

        <div
          ref={coreRef}
          className="v37-core"
          role="img"
          aria-label="Núcleo audiovisual PatroAI"
        >
          <span className="v37-core__glow" aria-hidden="true" />
          <video
            aria-label="Vídeo em loop do núcleo PatroAI"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/assets/patroai-logo-integrated.png"
            src="/media/patroai-v37-logo-loop.mp4"
          />
        </div>

        <div className="v37-lobby__copy">
          <h2>Escolha por onde deseja entrar.</h2>
          <p>O núcleo permanece vivo enquanto você navega.</p>
        </div>

        <nav className="v37-lobby__nodes" aria-label="Rotas da experiência imersiva">
          {nodes.map(([index, label, target], nodeIndex) => (
            <button
              key={label}
              className={`v37-node v37-node--${nodeIndex + 1}`}
              type="button"
              onClick={() => exitTo(target)}
            >
              <em>{index}</em>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button
          className="v37-access"
          type="button"
          onClick={enterPrivateAccess}
        >
          Acessar Plataforma
        </button>

        <div
          className="v37-dock"
          aria-label="Controle da experiência sonora"
        >
          <button
            type="button"
            onClick={() => void toggleAudio()}
            aria-label={playing ? "Pausar música" : "Reproduzir música"}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <span>FAIXA IMERSIVA</span>
          <button
            type="button"
            onClick={() => {
              const track = audio();
              if (track) track.muted = !track.muted;
            }}
            aria-label="Alternar mudo"
          >
            ♪
          </button>
        </div>
      </div>
    </section>
  );
}
