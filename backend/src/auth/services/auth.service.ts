import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { UserRole } from '@prisma/client';
import { SignupRequest } from '../dto/signup.dto';
import { SigninRequest } from '../dto/signin.dto';
import {
  AuthResponse,
  RefreshTokenResponse,
} from '../types/auth-response.type';
import { GoogleRequest } from '../types/google-request.type';
import { JwtPayload } from '../types/jwt-payload.type';
import { User } from '../types/user.type';
import { UserAccountService } from './user-account.service';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAccountService: UserAccountService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}

  async signup(dto: SignupRequest) {
    return this.userAccountService.createUserWithCredentials(dto);
  }

  async signin(dto: SigninRequest, response: Response): Promise<AuthResponse> {
    const user = await this.userAccountService.validateCredentials(
      dto.email,
      dto.password,
    );
    return this.issueTokensAndRespond(user, response);
  }

  async signupOrLoginWithGoogle(
    req: GoogleRequest,
    response: Response,
  ): Promise<AuthResponse> {
    const user = await this.userAccountService.signupOrLoginWithGoogle(
      req.user,
    );
    return this.issueTokensAndRespond(user, response);
  }

  async refreshAccessToken(
    request: Request,
    response: Response,
  ): Promise<RefreshTokenResponse> {
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { payload, storedTokenId } =
      await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userAccountService.findById(payload.sub);
    const tokenPayload = this.buildPayload(user);

    const isNearExpiry =
      await this.tokenService.isRefreshTokenNearExpiry(refreshToken);

    if (isNearExpiry) {
      const tokens = await this.tokenService.generateTokens(tokenPayload);
      await this.tokenService.revokeRefreshTokenById(storedTokenId);
      await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
      this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken);
      return { accessToken: tokens.accessToken, user };
    }

    const accessToken =
      await this.tokenService.generateAccessToken(tokenPayload);
    return { accessToken, user };
  }

  async logout(
    request: Request,
    response: Response,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies['refreshToken'];

    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }

    this.cookieService.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(
    userId: string,
    response: Response,
  ): Promise<{ message: string }> {
    await this.tokenService.revokeAllUserTokens(userId);
    this.cookieService.clearAuthCookies(response);
    return { message: 'Logged out from all devices successfully' };
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private buildPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar ?? undefined,
    };
  }

  private async issueTokensAndRespond(
    user: User,
    response: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.tokenService.generateTokens(
      this.buildPayload(user),
    );
    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
    this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }
}
