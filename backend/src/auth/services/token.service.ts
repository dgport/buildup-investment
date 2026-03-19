import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokens } from '../types/auth-tokens.type';
import { calculateExpiryDate } from '../../common/utils/expiry-date.util';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Token Generation ────────────────────────────────────────────────────────

  async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);
    return { accessToken, refreshToken };
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.signAccessToken(payload);
  }

  // ─── Verification ────────────────────────────────────────────────────────────

  async verifyRefreshToken(
    token: string,
  ): Promise<{ payload: JwtPayload; storedTokenId: string }> {
    let payload: JwtPayload;

    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.prisma.session.findFirst({
      where: {
        token,
        userId: payload.sub,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException(
        'Refresh token has been revoked or expired',
      );
    }

    return { payload, storedTokenId: storedToken.id };
  }

  // ─── Persistence ─────────────────────────────────────────────────────────────

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = calculateExpiryDate(
      this.getExpiry('JWT_REFRESH_TOKEN_EXPIRATION', '7d'),
    );

    await this.prisma.session.upsert({
      where: { token },
      create: { token, userId, expiresAt, isRevoked: false },
      update: { userId, expiresAt, isRevoked: false },
    });
  }

  async isRefreshTokenNearExpiry(
    token: string,
    thresholdDays = 1,
  ): Promise<boolean> {
    const stored = await this.prisma.session.findFirst({
      where: { token, isRevoked: false },
    });

    if (!stored) return true;

    const threshold = new Date(
      Date.now() + thresholdDays * 24 * 60 * 60 * 1000,
    );
    return stored.expiresAt <= threshold;
  }

  // ─── Revocation ──────────────────────────────────────────────────────────────

  async revokeRefreshTokenById(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { token, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  // ─── Maintenance ─────────────────────────────────────────────────────────────

  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired/revoked tokens`);
    return { deletedCount: result.count };
  }

  async getTokenStats() {
    const now = new Date();
    const [total, active, expired, revoked] = await Promise.all([
      this.prisma.session.count(),
      this.prisma.session.count({
        where: { isRevoked: false, expiresAt: { gt: now } },
      }),
      this.prisma.session.count({
        where: { isRevoked: false, expiresAt: { lte: now } },
      }),
      this.prisma.session.count({ where: { isRevoked: true } }),
    ]);

    return { total, active, expired, revoked };
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.getExpiry('JWT_ACCESS_TOKEN_EXPIRATION', '15m'),
    });
  }

  private signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getExpiry('JWT_REFRESH_TOKEN_EXPIRATION', '7d'),
    });
  }

  private getExpiry(key: string, fallback: StringValue): StringValue {
    return (this.config.get<string>(key) ?? fallback) as StringValue;
  }
}
