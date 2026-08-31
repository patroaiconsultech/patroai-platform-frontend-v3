/**
 * PatroAI immersive landing V3.8.1 — Mobile-first Aurora Gate + Audio Bridge.
 *
 * Contract:
 * - first interaction is an explicit immersive audio consent gate;
 * - audio.play() is invoked inside the original user gesture;
 * - one shared Web Audio analyser is created at most once for this module;
 * - starfield + aurora consume live --music-* variables;
 * - no decorative orbit/ring geometry;
 * - mobile is the primary composition;
 * - /access contract remains untouched.
 */
import { useEffect, useRef, useState } from "react";

type V37ImmersiveProps = {
  onPrivateAccess: () => void | Promise<void>;
};

type Stage = "intro" | "lobby" | "exiting" | "content";

type SharedAudioBridge = {
  element: HTMLAudioElement;
  context: AudioContext | null;
  source: MediaElementAudioSourceNode | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array | null;
  frame: number;
  lastSampleAt: number;
  low: number;
  mid: number;
  high: number;
  beatFast: number;
  beatSlow: number;
  beat: number;
};

const EXIT_DURATION_MS = 820;
const PRIVATE_EXIT_DURATION_MS = 560;
const MOBILE_AUDIO_SAMPLE_MS = 34;

let sharedAudioBridge: SharedAudioBridge | null = null;

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

function getImmersiveAudio() {
  return document.getElementById(
    "patroaiImmersiveAudio",
  ) as HTMLAudioElement | null;
}

function averageBand(data: Uint8Array, from: number, to: number) {
  const start = Math.max(0, Math.min(data.length - 1, Math.floor(from)));
  const end = Math.max(start + 1, Math.min(data.length, Math.ceil(to)));
  let sum = 0;
  for (let index = start; index < end; index += 1) sum += data[index] ?? 0;
  return sum / Math.max(1, end - start) / 255;
}

function setMusicVariables(low: number, mid: number, high: number, beat: number) {
  const root = document.documentElement;
  const energy = Math.min(1, low * 0.40 + mid * 0.38 + high * 0.22);
  root.style.setProperty("--music-low", low.toFixed(3));
  root.style.setProperty("--music-bass", low.toFixed(3));
  root.style.setProperty("--music-mid", mid.toFixed(3));
  root.style.setProperty("--music-high", high.toFixed(3));
  root.style.setProperty("--music-beat", beat.toFixed(3));
  root.style.setProperty("--music-energy", energy.toFixed(3));
  root.style.setProperty("--music-pulse", Math.min(1, low * 0.46 + beat * 0.80).toFixed(3));
}

function resetMusicVariables() {
  setMusicVariables(0, 0, 0, 0);
}

function ensureSharedAudioBridge(track: HTMLAudioElement) {
  if (sharedAudioBridge?.element === track) return sharedAudioBridge;

  // Playback must remain functional even when Web Audio is unsupported or
  // unavailable. The analyser is enhancement, never a gate for sound.
  const bridge: SharedAudioBridge = {
    element: track,
    context: null,
    source: null,
    analyser: null,
    frequencyData: null,
    frame: 0,
    lastSampleAt: 0,
    low: 0,
    mid: 0,
    high: 0,
    beatFast: 0,
    beatSlow: 0,
    beat: 0,
  };

  sharedAudioBridge = bridge;
  track.dataset.patroaiAudioBridge = "v381";

  if (prefersReducedMotion()) return bridge;

  const AudioContextClass =
    window.AudioContext ||
    (
      window as Window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextClass) return bridge;

  try {
    const mobileProfile =
      window.innerWidth <= 820 ||
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    bridge.context = new AudioContextClass(
      mobileProfile
        ? { latencyHint: "playback" }
        : { latencyHint: "interactive" },
    );
    bridge.source = bridge.context.createMediaElementSource(track);
    bridge.analyser = bridge.context.createAnalyser();
    bridge.analyser.fftSize = mobileProfile ? 64 : 256;
    bridge.analyser.smoothingTimeConstant = mobileProfile ? 0.76 : 0.66;
    bridge.frequencyData = new Uint8Array(bridge.analyser.frequencyBinCount);

    bridge.source.connect(bridge.analyser);
    bridge.analyser.connect(bridge.context.destination);
  } catch {
    // Sound remains available through HTMLMediaElement even if analysis fails.
    bridge.context = null;
    bridge.source = null;
    bridge.analyser = null;
    bridge.frequencyData = null;
  }

  return bridge;
}

function startReactiveFrame(bridge: SharedAudioBridge) {
  if (!bridge.analyser || !bridge.frequencyData || bridge.frame) return;

  const render = (timestamp: number) => {
    bridge.frame = 0;

    if (bridge.element.paused || bridge.element.ended) {
      resetMusicVariables();
      return;
    }

    const mobileProfile =
      window.innerWidth <= 820 ||
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (
      document.visibilityState === "visible" &&
      (!mobileProfile || timestamp - bridge.lastSampleAt >= MOBILE_AUDIO_SAMPLE_MS)
    ) {
      bridge.lastSampleAt = timestamp;
      bridge.analyser?.getByteFrequencyData(bridge.frequencyData!);

      const count = bridge.frequencyData!.length;
      const lowRaw = averageBand(bridge.frequencyData!, 0, count * 0.18);
      const midRaw = averageBand(bridge.frequencyData!, count * 0.18, count * 0.58);
      const highRaw = averageBand(bridge.frequencyData!, count * 0.58, count);

      bridge.low += (lowRaw - bridge.low) * 0.34;
      bridge.mid += (midRaw - bridge.mid) * 0.30;
      bridge.high += (highRaw - bridge.high) * 0.28;

      const instantaneous = lowRaw * 0.64 + midRaw * 0.24 + highRaw * 0.12;
      bridge.beatFast += (instantaneous - bridge.beatFast) * 0.52;
      bridge.beatSlow += (instantaneous - bridge.beatSlow) * 0.055;
      const candidate = Math.min(
        1,
        Math.max(0, (bridge.beatFast - bridge.beatSlow * 1.015) * 12.5),
      );
      bridge.beat =
        candidate > bridge.beat
          ? bridge.beat + (candidate - bridge.beat) * 0.90
          : bridge.beat * 0.72;

      setMusicVariables(
        Math.min(1, bridge.low * 1.55),
        Math.min(1, bridge.mid * 1.62),
        Math.min(1, bridge.high * 1.78),
        Math.min(1, bridge.beat),
      );
    }

    bridge.frame = window.requestAnimationFrame(render);
  };

  bridge.frame = window.requestAnimationFrame(render);
}

function stopReactiveFrame(bridge: SharedAudioBridge | null) {
  if (bridge?.frame) {
    window.cancelAnimationFrame(bridge.frame);
    bridge.frame = 0;
  }
  resetMusicVariables();
}

export function V37Immersive({ onPrivateAccess }: V37ImmersiveProps) {
  const [stage, setStage] = useState<Stage>("intro");
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const coreRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    const track = getImmersiveAudio();
    if (!track) return;

    const onPlay = () => {
      setPlaying(true);
      setAudioError("");
      const bridge = ensureSharedAudioBridge(track);
      startReactiveFrame(bridge);
    };
    const onPause = () => {
      setPlaying(false);
      stopReactiveFrame(sharedAudioBridge);
    };
    const onEnded = () => {
      setPlaying(false);
      stopReactiveFrame(sharedAudioBridge);
    };

    track.addEventListener("play", onPlay);
    track.addEventListener("pause", onPause);
    track.addEventListener("ended", onEnded);

    setPlaying(!track.paused);

    return () => {
      track.removeEventListener("play", onPlay);
      track.removeEventListener("pause", onPause);
      track.removeEventListener("ended", onEnded);
    };
  }, []);

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

  const enterImmersive = async (withSound: boolean) => {
    if (stage !== "intro") return;

    const track = getImmersiveAudio();

    if (!withSound) {
      if (track) {
        track.pause();
        track.currentTime = 0;
      }
      stopReactiveFrame(sharedAudioBridge);
      setPlaying(false);
      setAudioError("");
      setStage("lobby");
      return;
    }

    if (!track) {
      setPlaying(false);
      setAudioError("A trilha não foi encontrada. Você pode continuar sem áudio.");
      setStage("lobby");
      return;
    }

    track.currentTime = 0;
    const bridge = ensureSharedAudioBridge(track);

    // Critical mobile contract: resume() and play() are INVOKED synchronously
    // inside the original button gesture. We only await after both calls exist.
    let resumePromise: Promise<void> = Promise.resolve();
    if (bridge.context?.state === "suspended") {
      resumePromise = bridge.context.resume();
    }

    const playPromise = track.play();

    try {
      await Promise.all([resumePromise, playPromise]);
      setPlaying(true);
      setAudioError("");
      startReactiveFrame(bridge);
    } catch {
      setPlaying(false);
      setAudioError(
        "Não foi possível iniciar o áudio automaticamente. Toque no controle de som para tentar novamente.",
      );
    }

    setStage("lobby");
  };

  const toggleAudio = async () => {
    const track = getImmersiveAudio();

    if (!track) {
      setPlaying(false);
      setAudioError("A trilha sonora não está disponível neste dispositivo.");
      return;
    }

    if (!track.paused) {
      track.pause();
      setPlaying(false);
      stopReactiveFrame(sharedAudioBridge);
      return;
    }

    const bridge = ensureSharedAudioBridge(track);

    let resumePromise: Promise<void> = Promise.resolve();
    if (bridge.context?.state === "suspended") {
      resumePromise = bridge.context.resume();
    }
    const playPromise = track.play();

    try {
      await Promise.all([resumePromise, playPromise]);
      setPlaying(true);
      setAudioError("");
      startReactiveFrame(bridge);
    } catch {
      setPlaying(false);
      setAudioError(
        "O navegador bloqueou a reprodução. Toque novamente no controle de áudio.",
      );
    }
  };

  if (stage === "content") return null;

  return (
    <section
      className={`v37-immersive v38-immersive v37-immersive--${stage}`}
      data-audio-active={playing ? "true" : "false"}
      aria-label="Experiência imersiva PatroAI"
    >
      <div className="v37-atmosphere" aria-hidden="true" />

      <div className="v38-aurora" aria-hidden="true">
        <i className="v38-aurora__band v38-aurora__band--gold" />
        <i className="v38-aurora__band v38-aurora__band--cyan" />
        <i className="v38-aurora__band v38-aurora__band--violet" />
      </div>

      <div className="v37-stars v37-stars--base" aria-hidden="true" />
      <div className="v37-stars v37-stars--low" aria-hidden="true" />
      <div className="v37-stars v37-stars--mid" aria-hidden="true" />
      <div className="v37-stars v37-stars--high" aria-hidden="true" />

      {stage === "intro" ? (
        <div className="v38-entry" role="dialog" aria-modal="true" aria-labelledby="v38-entry-title">
          <div className="v38-entry__halo" aria-hidden="true" />
          <img
            className="v38-entry__mark"
            src="/assets/patroai-logo-integrated.png"
            alt=""
          />
          <p className="v38-entry__eyebrow">PATROAI · EXPERIÊNCIA IMERSIVA</p>
          <h1 id="v38-entry-title">Esta é uma página imersiva.</h1>
          <p className="v38-entry__copy">
            A experiência combina imagem, atmosfera e uma faixa sonora reativa.
            Escolha como deseja entrar.
          </p>
          <div className="v38-entry__actions">
            <button
              className="v38-entry__sound"
              type="button"
              onClick={() => void enterImmersive(true)}
            >
              <span aria-hidden="true">♪</span>
              <strong>Entrar com som</strong>
            </button>
            <button
              className="v38-entry__silent"
              type="button"
              onClick={() => void enterImmersive(false)}
            >
              Entrar sem som
            </button>
          </div>
          <small>Você poderá alterar o áudio depois.</small>
        </div>
      ) : null}

      <div
        className="v37-lobby"
        aria-hidden={stage === "intro" ? "true" : undefined}
        onPointerMove={(event) => {
          if (stage !== "lobby" || prefersReducedMotion()) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          coreRef.current?.style.setProperty("--core-x", `${(x * 7).toFixed(2)}px`);
          coreRef.current?.style.setProperty("--core-y", `${(y * 5).toFixed(2)}px`);
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
          <span>{audioError || "FAIXA IMERSIVA"}</span>
        </div>
      </div>
    </section>
  );
}
