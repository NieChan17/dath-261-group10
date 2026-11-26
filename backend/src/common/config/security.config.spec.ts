import { ConfigService } from '@nestjs/config';
import {
  escapeLikePattern,
  getJwtSecrets,
  isCookieSecure,
  isOriginAllowed,
  parseCorsOrigins,
} from './security.config';

describe('SecurityConfig', () => {
  const buildConfig = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.NODE_ENV;
    delete process.env.COOKIE_SECURE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getJwtSecrets', () => {
    it('should allow ephemeral defaults in development mode', () => {
      const cfg = buildConfig({ NODE_ENV: 'development' });
      const secrets = getJwtSecrets(cfg);
      expect(secrets.accessSecret).toBeTruthy();
      expect(secrets.refreshSecret).toBeTruthy();
    });

    it('should fail fast in production when secrets are missing', () => {
      const cfg = buildConfig({ NODE_ENV: 'production' });
      expect(() => getJwtSecrets(cfg)).toThrow(/JWT_SECRET/);
    });

    it('should reject hardcoded fallback secrets in production', () => {
      const cfg = buildConfig({
        NODE_ENV: 'production',
        JWT_SECRET: 'super-secret-edupulse-jwt-key-2026-hk261',
        JWT_REFRESH_SECRET: 'super-secret-refresh-key-edupulse-2026',
      });
      expect(() => getJwtSecrets(cfg)).toThrow(/Security Error/);
    });

    it('should accept strong >=32 char secrets in production', () => {
      const strongAccess = 'a'.repeat(40);
      const strongRefresh = 'b'.repeat(40);
      const cfg = buildConfig({
        NODE_ENV: 'production',
        JWT_SECRET: strongAccess,
        JWT_REFRESH_SECRET: strongRefresh,
      });
      expect(getJwtSecrets(cfg)).toEqual({
        accessSecret: strongAccess,
        refreshSecret: strongRefresh,
      });
    });
  });

  describe('isOriginAllowed', () => {
    it('should reject unknown origins in production', () => {
      const allowlist = parseCorsOrigins('https://edupulse.example.com');
      expect(isOriginAllowed('https://evil.attacker.test', allowlist, 'production')).toBe(false);
      expect(isOriginAllowed('https://edupulse.example.com', allowlist, 'production')).toBe(true);
    });

    it('should reject wildcard CORS in production', () => {
      const allowlist = parseCorsOrigins('*');
      expect(isOriginAllowed('https://evil.attacker.test', allowlist, 'production')).toBe(false);
    });

    it('should allow localhost in development', () => {
      const allowlist = parseCorsOrigins('');
      expect(isOriginAllowed('http://localhost:3001', allowlist, 'development')).toBe(true);
    });
  });

  describe('isCookieSecure', () => {
    it('should default to true in production and honor explicit COOKIE_SECURE override', () => {
      expect(isCookieSecure(buildConfig({ NODE_ENV: 'production' }))).toBe(true);
      expect(
        isCookieSecure(buildConfig({ NODE_ENV: 'production', COOKIE_SECURE: 'false' })),
      ).toBe(false);
      expect(isCookieSecure(buildConfig({ NODE_ENV: 'development' }))).toBe(false);
    });
  });

  describe('escapeLikePattern', () => {
    it('should escape LIKE wildcard characters', () => {
      expect(escapeLikePattern('100%_test\\path')).toBe('100\\%\\_test\\\\path');
    });
  });
});
