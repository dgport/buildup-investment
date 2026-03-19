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
import { AuthGuard } from '@nestjs/passport';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly scheduledTasksService: ScheduledTasksService,
    private readonly userAccountService: UserAccountService,
    private readonly config: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupRequest) {
    const result = await this.authService.signup(dto);
    return {
      success: true,
      message:
        'Account created. Please check your email to verify your account.',
      userId: result.id,
      email: result.email,
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SigninRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signin(dto, res);
  }

  @Post('refresh-token')
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
    return user;
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    try {
      const result = await this.authService.signupOrLoginWithGoogle(req, res);
      res.redirect(
        `${frontendUrl}/google-auth-success?token=${result.accessToken}`,
      );
    } catch (error) {
      const message = encodeURIComponent(
        error.message ?? 'Authentication failed',
      );
      res.redirect(`${frontendUrl}/auth/error?message=${message}`);
    }
  }

  // ─── Email Verification ───────────────────────────────────────────────────────

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('Verification token is required');
    }
    return this.userAccountService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body('email') email: string) {
    return this.userAccountService.resendVerificationEmail(email);
  }

  // ─── Password Management ──────────────────────────────────────────────────────

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.userAccountService.sendUpdatePasswordEmail(email);
  }

  @Post('reset-password')
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
