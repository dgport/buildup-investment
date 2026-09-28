import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';

export function safeReturnPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    /[\\\s]/.test(value)
  )
    return '/dashboard';
  try {
    const base = 'https://buildup.ge';
    const url = new URL(value, base);
    return url.origin === base
      ? url.pathname + url.search + url.hash
      : '/dashboard';
  } catch {
    return '/dashboard';
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    super();
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/api/auth/google',
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<
        Request & { googleReturnTo?: string; googleLocale?: string }
      >();
    const res = context.switchToHttp().getResponse<Response>();
    const callback = req.path.endsWith('/callback');
    try {
      if (callback) {
        const state = req.query.state;
        const cookie = req.cookies?.buildupGoogleState;
        res.clearCookie('buildupGoogleState', this.cookieOptions());
        if (typeof state !== 'string' || !cookie || state !== cookie)
          throw new Error('Invalid OAuth state');
        const payload = await this.jwt.verifyAsync(state, {
          audience: 'buildup-google-state',
        });
        req.googleReturnTo = safeReturnPath(payload.next);
        req.googleLocale = payload.locale === 'en' ? 'en' : 'ka';
        if (req.query.error) throw new Error('Google sign-in cancelled');
      }
      return (await super.canActivate(context)) as boolean;
    } catch {
      const locale = req.googleLocale === 'en' ? '/en' : '';
      res.redirect(
        `${this.config.getOrThrow<string>('FRONTEND_URL')}${locale}/google-auth-error?next=${encodeURIComponent(req.googleReturnTo ?? '/dashboard')}`,
      );
      return false;
    }
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.path.endsWith('/callback')) return { session: false };
    const state = this.jwt.sign(
      {
        nonce: randomBytes(24).toString('hex'),
        next: safeReturnPath(req.query.next),
        locale: req.query.locale === 'en' ? 'en' : 'ka',
      },
      { expiresIn: '10m', audience: 'buildup-google-state' },
    );
    context
      .switchToHttp()
      .getResponse<Response>()
      .cookie('buildupGoogleState', state, {
        ...this.cookieOptions(),
        maxAge: 10 * 60 * 1000,
      });
    return { session: false, state, prompt: 'select_account' };
  }
}
