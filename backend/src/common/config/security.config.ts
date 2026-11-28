import { ConfigService } from '@nestjs/config';

const KNOWN_INSECURE_SECRETS = new Set([
  'super-secret-edupulse-jwt-key-2026-hk261',
  'super-secret-refresh-key-edupulse-2026',
  'test_secret',
]);

const MIN_PRODUCTION_SECRET_LENGTH = 32;

export function isStrictEnvironment(nodeEnv?: string | null): boolean {
  return nodeEnv === 'production' || nodeEnv === 'staging';
}

function resolveSecret(
  value: string | undefined | null,
  envVarName: string,
  devFallback: string,
  strict: boolean,
): string {
  const trimmed = value?.trim();

  if (!strict) {
    return trimmed || devFallback;
  }

  if (
    !trimmed ||
    trimmed.length < MIN_PRODUCTION_SECRET_LENGTH ||
    KNOWN_INSECURE_SECRETS.has(trimmed) ||
    trimmed.startsWith('CHANGE_ME')
  ) {
    throw new Error(
      `Security Error: ${envVarName} must be set to a strong random secret (>= ${MIN_PRODUCTION_SECRET_LENGTH} characters) outside development.`,
    );
  }

  return trimmed;
}

export function getJwtSecrets(configService: ConfigService): {
  accessSecret: string;
  refreshSecret: string;
} {
  const nodeEnv = configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
  const strict = isStrictEnvironment(nodeEnv);

  const accessSecret = resolveSecret(
    configService.get<string>('JWT_SECRET') ?? process.env.JWT_SECRET,
    'JWT_SECRET',
    'dev-only-ephemeral-access-secret-do-not-use-in-prod',
    strict,
  );

  const refreshSecret = resolveSecret(
    configService.get<string>('JWT_REFRESH_SECRET') ??
      process.env.JWT_REFRESH_SECRET,
    'JWT_REFRESH_SECRET',
    'dev-only-ephemeral-refresh-secret-do-not-use-in-prod',
    strict,
  );

  return { accessSecret, refreshSecret };
}

export function isCookieSecure(configService: ConfigService): boolean {
  const override =
    configService.get<string>('COOKIE_SECURE') ?? process.env.COOKIE_SECURE;
  if (override === 'true') return true;
  if (override === 'false') return false;

  const nodeEnv = configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
  return nodeEnv === 'production';
}

export function parseCorsOrigins(rawOrigin?: string | null): string[] {
  if (!rawOrigin || !rawOrigin.trim()) {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }
  return rawOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isOriginAllowed(
  origin: string | undefined,
  allowlist: string[],
  nodeEnv?: string | null,
): boolean {
  // Non-browser clients (curl, server-to-server health probes, Postman) omit Origin.
  if (!origin) {
    return true;
  }

  if (allowlist.includes('*')) {
    return !isStrictEnvironment(nodeEnv);
  }

  if (allowlist.includes(origin)) {
    return true;
  }

  // Allow localhost origins only in non-strict local development/testing.
  if (!isStrictEnvironment(nodeEnv)) {
    try {
      const parsed = new URL(origin);
      return (
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.endsWith('.trycloudflare.com') ||
        parsed.hostname.endsWith('.loca.lt')
      );
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Resolves PostgreSQL SSL options for cloud-managed databases (e.g. Render, RDS).
 */
export function getDatabasePoolSsl(
  connectionString: string,
  databaseSsl?: string | null,
): { rejectUnauthorized: boolean } | undefined {
  const normalizedFlag = databaseSsl?.trim().toLowerCase();
  if (normalizedFlag === 'false') {
    return undefined;
  }
  if (
    normalizedFlag === 'true' ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('render.com')
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

/**
 * Escapes PostgreSQL LIKE/ILIKE metacharacters (% and _) to prevent wildcard DoS.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
