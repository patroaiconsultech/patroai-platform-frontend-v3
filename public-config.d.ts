export type PublicConfigKey = "VITE_STREAM_TIMEOUT_MS";

export type PublicConfigValidation = {
  ok: boolean;
  value: string;
  reason?: string;
};

export type PublicConfigResolution = PublicConfigValidation & {
  source: "runtime" | "build";
};

export const PUBLIC_CONFIG_KEYS: readonly PublicConfigKey[];

export function validatePublicConfigValue(
  key: PublicConfigKey,
  raw: unknown,
): PublicConfigValidation;

export function resolvePublicConfigValue(
  key: PublicConfigKey,
  runtimeConfig?: Record<string, unknown>,
  buildConfig?: Record<string, unknown>,
): PublicConfigResolution;

export function collectPublicRuntimeConfig(
  env?: Record<string, unknown>,
): {
  config: Readonly<Record<string, string>>;
  errors: ReadonlyArray<{ key: PublicConfigKey; reason?: string }>;
};

export function runtimeEnvScript(
  config: Readonly<Record<string, string>>,
): string;
