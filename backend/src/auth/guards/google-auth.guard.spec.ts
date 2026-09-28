import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthGuard, safeReturnPath } from './google-auth.guard';
import { GoogleStrategy } from '../strategies/google.strategy';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EmailInput } from '../dto/email.dto';

describe('Google round trip and recovery validation', () => {
  const config = new ConfigService({
    NODE_ENV: 'production',
    FRONTEND_URL: 'https://buildup.ge',
    GOOGLE_CLIENT_ID: 'test',
    GOOGLE_CLIENT_SECRET: 'test',
    GOOGLE_CALLBACK_URL: 'https://api.buildup.ge/api/auth/google/callback',
  });
  const jwt = new JwtService({
    secret: 'test-secret-not-a-production-credential',
  });
  it.each([
    '//evil.example',
    '/\\evil.example',
    'https://evil.example',
    'javascript:alert(1)',
    '/\n/evil.example',
  ])('rejects an external return URL: %s', (value) => {
    expect(safeReturnPath(value)).toBe('/dashboard');
  });
  it('preserves local admin, listing and rental destinations', () => {
    expect(safeReturnPath('/admin')).toBe('/admin');
    expect(safeReturnPath('/properties/new?dealType=RENT')).toBe(
      '/properties/new?dealType=RENT',
    );
  });
  it('binds signed, expiring state to a secure browser cookie', () => {
    const cookie = jest.fn();
    const guard = new GoogleAuthGuard(config, jwt);
    const ctx: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          path: '/api/auth/google',
          query: { next: '/admin', locale: 'en' },
        }),
        getResponse: () => ({ cookie }),
      }),
    };
    const options = guard.getAuthenticateOptions(ctx);
    const payload = jwt.verify(options.state!, {
      audience: 'buildup-google-state',
    });
    expect(payload.next).toBe('/admin');
    expect(payload.exp - payload.iat).toBe(600);
    expect(cookie).toHaveBeenCalledWith(
      'buildupGoogleState',
      options.state,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      }),
    );
  });
  it.each([{}, { state: 'forged' }])(
    'handles missing or mismatched state without a raw API error',
    async (query) => {
      const redirect = jest.fn();
      const guard = new GoogleAuthGuard(config, jwt);
      const ctx: any = {
        switchToHttp: () => ({
          getRequest: () => ({
            path: '/api/auth/google/callback',
            query,
            cookies: {},
          }),
          getResponse: () => ({ redirect, clearCookie: jest.fn() }),
        }),
      };
      expect(await guard.canActivate(ctx)).toBe(false);
      expect(redirect).toHaveBeenCalledWith(
        'https://buildup.ge/google-auth-error?next=%2Fdashboard',
      );
    },
  );
  it('rejects a Google profile with an unverified email', () => {
    const done = jest.fn();
    new GoogleStrategy(config).validate(
      '',
      '',
      {
        emails: [{ value: 'a@example.com' }],
        _json: { email_verified: false },
      },
      done,
    );
    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
  });
  it('accepts a verified profile even without a picture or family name', () => {
    const done = jest.fn();
    new GoogleStrategy(config).validate(
      '',
      '',
      {
        id: 'g1',
        emails: [{ value: 'A@EXAMPLE.COM' }],
        _json: { email_verified: true },
        displayName: 'Ana',
      },
      done,
    );
    expect(done).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        email: 'a@example.com',
        firstname: 'Ana',
        lastname: '',
      }),
    );
  });
  it('normalizes recovery addresses and rejects malformed or missing email values', async () => {
    const valid = plainToInstance(EmailInput, { email: ' OWNER@EXAMPLE.COM ' });
    expect(valid.email).toBe('owner@example.com');
    expect(await validate(valid)).toHaveLength(0);
    for (const email of [undefined, {}, 123, 'not-email'])
      expect(
        (await validate(plainToInstance(EmailInput, { email }))).length,
      ).toBeGreaterThan(0);
  });
});
