import React from "react";

export type RealtimeAvatarState =
  | "ready"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

type Props = {
  state: RealtimeAvatarState;
  agentName: string;
};

export default function RealtimeAvatar({ state, agentName }: Props) {
  return (
    <div
      className="realtime-avatar"
      data-state={state}
      role="img"
      aria-label={`Avatar de ${agentName}: ${state}`}
    >
      <span className="realtime-avatar__aura" aria-hidden="true" />
      <span className="realtime-avatar__orbit realtime-avatar__orbit--outer" aria-hidden="true" />
      <span className="realtime-avatar__orbit realtime-avatar__orbit--inner" aria-hidden="true" />
      <svg
        className="realtime-avatar__portrait"
        viewBox="0 0 220 300"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="patroaiAvatarMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#162631" />
            <stop offset=".45" stopColor="#0a151d" />
            <stop offset="1" stopColor="#050b10" />
          </linearGradient>
          <linearGradient id="patroaiAvatarEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#37c5ff" />
            <stop offset=".52" stopColor="#7d6bff" />
            <stop offset="1" stopColor="#f6c453" />
          </linearGradient>
          <radialGradient id="patroaiAvatarCore">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".28" stopColor="#f6c453" />
            <stop offset=".62" stopColor="#37c5ff" stopOpacity=".62" />
            <stop offset="1" stopColor="#37c5ff" stopOpacity="0" />
          </radialGradient>
          <filter id="patroaiAvatarGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="realtime-avatar__bust">
          <path
            className="realtime-avatar__shoulders"
            d="M29 286c9-43 31-71 65-82h32c35 11 57 39 65 82H29Z"
            fill="url(#patroaiAvatarMetal)"
            stroke="url(#patroaiAvatarEdge)"
          />
          <path
            className="realtime-avatar__neck"
            d="M91 185h38l11 40H80l11-40Z"
            fill="url(#patroaiAvatarMetal)"
            stroke="rgba(55,197,255,.42)"
          />
          <path
            className="realtime-avatar__head"
            d="M66 76c8-34 29-53 44-53s36 19 44 53l-5 70c-2 27-19 48-39 48s-37-21-39-48l-5-70Z"
            fill="url(#patroaiAvatarMetal)"
            stroke="url(#patroaiAvatarEdge)"
          />
          <path
            className="realtime-avatar__temple"
            d="M68 91 89 73h42l21 18-9 12-15-10H92l-15 10-9-12Z"
            fill="rgba(55,197,255,.05)"
            stroke="rgba(55,197,255,.24)"
          />
          <path
            className="realtime-avatar__visor"
            d="M79 105c16-10 46-10 62 0l-7 18H86l-7-18Z"
            fill="rgba(55,197,255,.08)"
            stroke="rgba(55,197,255,.62)"
          />
          <path
            className="realtime-avatar__signal"
            d="M89 114h15m12 0h15"
            stroke="url(#patroaiAvatarEdge)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#patroaiAvatarGlow)"
          />
          <path
            className="realtime-avatar__face-line"
            d="M110 123v24m-15 12c9 7 21 7 30 0"
            fill="none"
            stroke="rgba(246,196,83,.38)"
            strokeLinecap="round"
          />
          <circle
            className="realtime-avatar__core"
            cx="110"
            cy="238"
            r="16"
            fill="url(#patroaiAvatarCore)"
            filter="url(#patroaiAvatarGlow)"
          />
          <path
            className="realtime-avatar__circuit"
            d="M110 222v-17m-16 34H62m64 0h32M95 251l-18 20m48-20 18 20"
            fill="none"
            stroke="rgba(55,197,255,.42)"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="realtime-avatar__scanline" aria-hidden="true" />
      <span className="realtime-avatar__floor" aria-hidden="true" />
    </div>
  );
}
