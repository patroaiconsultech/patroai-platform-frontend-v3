import React from "react";
import RealtimeAvatar, { RealtimeAvatarState } from "./RealtimeAvatar";

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
  speechLevel?: number;
  runtimeProven: boolean;
  ownershipLocked: boolean;
  onRealtimeToggle: () => void;
  onVoiceToggle: () => void;
  onShowRealtimeStatus: () => void;
};

function presenceState(
  realtimeState: RealtimeState,
): RealtimeAvatarState {
  if (realtimeState === "error") return "error";
  if (realtimeState === "speaking") return "speaking";
  if (
    realtimeState === "orkio_processing" ||
    realtimeState === "transcribing"
  ) {
    return "thinking";
  }
  if (realtimeState === "listening") {
    return "listening";
  }
  return "ready";
}

const stateCopy: Record<RealtimeAvatarState, { title: string; detail: string }> = {
  ready: {
    title: "Pronto para conversar",
    detail: "Ative o Realtime para iniciar uma conversa por voz.",
  },
  listening: {
    title: "Estou ouvindo",
    detail: "Fale naturalmente. Você pode interromper a qualquer momento.",
  },
  thinking: {
    title: "Construindo a resposta",
    detail: "Sua fala está sendo transformada em contexto para o Co-Criador.",
  },
  speaking: {
    title: "Falando com você",
    detail: "A resposta está sendo reproduzida agora.",
  },
  error: {
    title: "Conexão interrompida",
    detail: "Abra o status do Realtime para revisar a disponibilidade.",
  },
};

export default function ImmersivePresencePanel({
  agentName,
  agentRole,
  realtimeState,
  realtimeReady,
  realtimeBusy,
  voiceState,
  voiceReady,
  speechLevel = 0,
  runtimeProven,
  ownershipLocked,
  onRealtimeToggle,
  onVoiceToggle,
  onShowRealtimeStatus,
}: Props) {
  const state = presenceState(realtimeState);
  const realtimeActive = !["idle", "error"].includes(realtimeState);
  const copy = stateCopy[state];

  return (
    <aside
      className="immersive-presence"
      aria-label={`Presença de voz de ${agentName}`}
      data-state={state}
      data-realtime-active={realtimeActive ? "true" : "false"}
    >
      <button
        type="button"
        className="presence-mobile-toggle"
        onClick={onRealtimeToggle}
        aria-pressed={realtimeActive}
        aria-label={realtimeActive ? "Encerrar Realtime" : "Iniciar Realtime"}
      >
        <span className="presence-mobile-toggle__orb" aria-hidden="true" />
        <span>
          <strong>{agentName}</strong>
          <small>{copy.title}</small>
        </span>
      </button>

      <header className="immersive-presence__header">
        <div>
          <span>Presença do Co-Criador</span>
          <strong>{agentName}</strong>
          <small>{agentRole}</small>
        </div>
        <button
          type="button"
          className={
            runtimeProven
              ? "presence-proof presence-proof--proven"
              : "presence-proof"
          }
          onClick={onShowRealtimeStatus}
          title="Abrir status do Realtime"
        >
          {runtimeProven ? "REALTIME VERIFICADO" : "VERIFICAR REALTIME"}
        </button>
      </header>

      <div className="immersive-presence__stage">
        <RealtimeAvatar
          state={state}
          agentName={agentName}
          speechLevel={state === "speaking" ? speechLevel : 0}
        />
      </div>

      <section className="immersive-presence__runtime" aria-live="polite">
        <div className="presence-state-row">
          <span className="presence-state-led" aria-hidden="true" />
          <div>
            <strong>{copy.title}</strong>
            <small>{copy.detail}</small>
          </div>
        </div>

        <div
          className={
            state === "listening" || state === "speaking"
              ? "presence-wave presence-wave--active"
              : "presence-wave"
          }
          aria-hidden="true"
        >
          <i /><i /><i /><i /><i /><i /><i />
        </div>

        <div className="presence-trust">
          <span>{ownershipLocked ? "Identidade protegida" : "Preparando contexto"}</span>
          <span>{realtimeReady ? "Realtime disponível" : "Realtime em preparação"}</span>
          <span>{voiceReady ? "Voz disponível" : "Voz indisponível"}</span>
        </div>

        <div className="presence-actions">
          <button
            type="button"
            className={
              realtimeActive
                ? "presence-action presence-action--active"
                : "presence-action"
            }
            onClick={onRealtimeToggle}
            disabled={realtimeBusy}
            aria-pressed={realtimeActive}
          >
            <span aria-hidden="true">{realtimeActive ? "■" : "◉"}</span>
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

        <button
          type="button"
          className="presence-details-link"
          onClick={onShowRealtimeStatus}
        >
          Ver status e requisitos
        </button>
      </section>
    </aside>
  );
}
