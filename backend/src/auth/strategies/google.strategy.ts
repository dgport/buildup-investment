import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from '../types/google-request.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): void {
    const { name, emails, photos, id } = profile;

    if (!emails?.[0]?.value || profile._json?.email_verified !== true) {
      done(
        new UnauthorizedException('Google email must be verified'),
        undefined,
      );
      return;
    }

    const user: GoogleUser = {
      googleId: id,
      email: emails[0].value.trim().toLowerCase(),
      firstname: name?.givenName || profile.displayName || 'User',
      lastname: name?.familyName || '',
      avatar: photos?.[0]?.value,
    };

    done(null, user);
  }
}
