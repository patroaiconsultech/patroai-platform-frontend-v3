/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STREAM_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
