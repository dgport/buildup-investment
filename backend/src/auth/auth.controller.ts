import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { EmailInput } from './dto/email.dto';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { AuthService } from './services/auth.service';

import { UserAccountService } from './services/user-account.service';
import { SignupRequest } from './dto/signup.dto';
import { SigninRequest } from './dto/signin.dto';
import { UpdatePasswordInput } from './dto/update-password.dto';
import { GoogleRequest } from './types/google-request.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './types/user.type';
import { ScheduledTasksService } from './services/sheduled-tasks.service';
import { withListingTermsStatus } from '@/common/constants/listing-terms';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly scheduledTasksService: ScheduledTasksService,
    private readonly userAccountService: UserAccountService,
    private readonly config: ConfigService,
  ) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupRequest) {
    const result = await this.authService.signup(dto);
    return {
      success: true,
      message: result.verificationEmailSent
        ? 'Account created. Please check your email to verify your account.'
        : 'Account created, but the verification email could not be sent. Request a new verification link.',
      userId: result.id,
      email: result.email,
      verificationEmailSent: result.verificationEmailSent,
    };
  }

  @Post('signin')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SigninRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signin(dto, res);
  }

  @Post('refresh-token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshAccessToken(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logoutAll(user.id, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: User) {
    return withListingTermsStatus(user);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    try {
      await this.authService.signupOrLoginWithGoogle(req, res);
      const context = req as GoogleRequest & {
        googleReturnTo?: string;
        googleLocale?: string;
      };
      const locale = context.googleLocale === 'en' ? '/en' : '';
      res.redirect(
        `${frontendUrl}${locale}/google-auth-success?next=${encodeURIComponent(context.googleReturnTo ?? '/dashboard')}`,
      );
    } catch {
      res.redirect(`${frontendUrl}/google-auth-error`);
    }
  }

  // ─── Email Verification ───────────────────────────────────────────────────────

  @Get('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyEmail(@Query('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('Verification token is required');
    }
    return this.userAccountService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body() dto: EmailInput) {
    return this.userAccountService.resendVerificationEmail(dto.email);
  }

  // ─── Password Management ──────────────────────────────────────────────────────

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: EmailInput) {
    return this.userAccountService.sendUpdatePasswordEmail(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: UpdatePasswordInput) {
    await this.userAccountService.updatePassword(dto);
    return { message: 'Password updated successfully' };
  }

  // ─── Admin ────────────────────────────────────────────────────────────────────

  @Post('cleanup-tokens')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cleanupTokens(@CurrentUser() user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    const result = await this.scheduledTasksService.manualTokenCleanup();
    if (!result.success) {
      throw new BadRequestException(`Token cleanup failed: ${result.error}`);
    }
    return { message: `Cleaned up ${result.deletedCount} expired tokens` };
  }
}
