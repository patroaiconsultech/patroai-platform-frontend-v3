import React from "react";

type RealtimeState =
  | "idle"
  | "connecting"
  | "listening"
  | "transcribing"
  | "orkio_processing"
  | "speaking"
  | "error";

type VoiceState = "idle" | "recording" | "transcribing" | "review";

type Props = {
  agentName: string;
  agentRole: string;
  realtimeState: RealtimeState;
  realtimeReady: boolean;
  realtimeBusy: boolean;
  voiceState: VoiceState;
  voiceReady: boolean;
  runtimeProven: boolean;
  ownershipLocked: boolean;
  onRealtimeToggle: () => void;
  onVoiceToggle: () => void;
  onShowRealtimeStatus: () => void;
};

type PresenceVisualState =
  | "ready"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

function presenceState(
  realtimeState: RealtimeState,
  voiceState: VoiceState,
): PresenceVisualState {
  if (realtimeState === "error") return "error";
  if (realtimeState === "speaking") return "speaking";
  if (
    realtimeState === "orkio_processing" ||
    realtimeState === "transcribing" ||
    voiceState === "transcribing"
  ) {
    return "thinking";
  }
  if (realtimeState === "listening" || voiceState === "recording") {
    return "listening";
  }
  return "ready";
}

const labels: Record<PresenceVisualState, string> = {
  ready: "READY",
  listening: "LISTENING",
  thinking: "THINKING",
  speaking: "SPEAKING",
  error: "ERROR",
};

export default function ImmersivePresencePanel({
  agentName,
  agentRole,
  realtimeState,
  realtimeReady,
  realtimeBusy,
  voiceState,
  voiceReady,
  runtimeProven,
  ownershipLocked,
  onRealtimeToggle,
  onVoiceToggle,
  onShowRealtimeStatus,
}: Props) {
  const state = presenceState(realtimeState, voiceState);
  const realtimeActive = !["idle", "error"].includes(realtimeState);

  return (
    <aside
      className="immersive-presence"
      aria-label={`Presença imersiva de ${agentName}`}
      data-state={state}
    >
      <header className="immersive-presence__header">
        <div>
          <span>Presença do Cocriador</span>
          <strong>{agentName}</strong>
          <small>{agentRole}</small>
        </div>
        <button
          type="button"
          className={runtimeProven ? "presence-proof presence-proof--proven" : "presence-proof"}
          onClick={onShowRealtimeStatus}
          title="Abrir status técnico do Realtime"
        >
          {runtimeProven ? "RUNTIME PROVADO" : "RUNTIME A VALIDAR"}
        </button>
      </header>

      <div className="immersive-presence__stage" aria-hidden="true">
        <div className="immersive-presence__halo" />
        <div className="immersive-humanoid">
          <div className="immersive-humanoid__head" />
          <div className="immersive-humanoid__neck" />
          <div className="immersive-humanoid__torso">
            <i className="immersive-circuit immersive-circuit--one" />
            <i className="immersive-circuit immersive-circuit--two" />
            <i className="immersive-circuit immersive-circuit--three" />
          </div>
          <div className="immersive-humanoid__arm immersive-humanoid__arm--left" />
          <div className="immersive-humanoid__arm immersive-humanoid__arm--right" />
          <div className="immersive-humanoid__pelvis" />
        </div>
      </div>

      <section className="immersive-presence__runtime" aria-live="polite">
        <div className="presence-state-row">
          <span className="presence-state-led" aria-hidden="true" />
          <strong>{labels[state]}</strong>
          <code>PRESENCE_V1</code>
        </div>

        <div
          className={state === "listening" || state === "speaking" ? "presence-wave presence-wave--active" : "presence-wave"}
          aria-hidden="true"
        >
          <i /><i /><i /><i /><i /><i /><i />
        </div>

        <div className="presence-governance">
          <span>ownership</span>
          <strong>{ownershipLocked ? "LOCKED" : "PENDING"}</strong>
        </div>
        <div className="presence-governance">
          <span>realtime</span>
          <strong>{realtimeReady ? "READY" : "GATED"}</strong>
        </div>
        <div className="presence-governance">
          <span>voice</span>
          <strong>{voiceReady ? "AVAILABLE" : "GATED"}</strong>
        </div>

        <div className="presence-actions">
          <button
            type="button"
            className={realtimeActive ? "presence-action presence-action--active" : "presence-action"}
            onClick={onRealtimeToggle}
            disabled={realtimeBusy}
            aria-pressed={realtimeActive}
          >
            <span aria-hidden="true">RT</span>
            {realtimeActive ? "Encerrar Realtime" : "Iniciar Realtime"}
          </button>
          <button
            type="button"
            className="presence-action presence-action--voice"
            onClick={onVoiceToggle}
            disabled={!voiceReady || voiceState === "transcribing"}
            aria-pressed={voiceState === "recording"}
          >
            <span aria-hidden="true">{voiceState === "recording" ? "■" : "◉"}</span>
            {voiceState === "recording" ? "Parar voz" : "Mensagem de voz"}
          </button>
        </div>

        <p>
          A presença visual reflete o estado do runtime; ela nunca substitui tenant,
          autoria, ownership ou persistência.
        </p>
      </section>
    </aside>
  );
}
