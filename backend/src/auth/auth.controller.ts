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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { ScheduledTasksService } from './services/sheduled-tasks.service';
import { UserAccountService } from './services/user-account.service';
import { SignupRequest } from './dto/signup.dto';
import { SigninRequest } from './dto/signin.dto';
import { UpdatePasswordInput } from './dto/update-password.dto';
import { User } from './types/user.type';
import { GoogleRequest } from './types/google-request.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly scheduledTasksService: ScheduledTasksService,
    private readonly userAccountService: UserAccountService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupRequest) {
    try {
      const result = await this.authService.signup(dto);
      return {
        success: true,
        message:
          'Account created successfully. Please check your email to verify your account.',
        userId: result.id,
        email: result.email,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Signup failed');
    }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SigninRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signin(dto, res);
    return result;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.cookies) {
      throw new BadRequestException('No cookies found in request');
    }
    return await this.authService.refreshAccessToken(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(req, res);
    return result;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const result = await this.authService.signupOrLoginWithGoogle(req, res);
      const redirectUrl = `http://localhost:5173/auth/success?token=${result.accessToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Google auth error:', error);
      const errorMessage = encodeURIComponent(
        error.message || 'Authentication failed',
      );
      const errorUrl = `http://localhost:5173/auth/error?message=${errorMessage}`;
      res.redirect(errorUrl);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Token is required');
    }
    const result = await this.userAccountService.verifyEmail(token);
    return { message: result.message };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body('email') email: string) {
    const result = await this.userAccountService.resendVerificationEmail(email);
    return { message: result.message };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async sendUpdatePasswordEmail(@Body('email') email: string) {
    const result = await this.userAccountService.sendUpdatePasswordEmail(email);
    return { message: result };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() dto: UpdatePasswordInput) {
    await this.userAccountService.updatePassword(dto);
    return { message: 'Password updated successfully' };
  }

  @Post('cleanup-tokens')
  @HttpCode(HttpStatus.OK)
  async cleanupTokens() {
    const result = await this.scheduledTasksService.manualTokenCleanup();

    if (result.success) {
      return {
        message: `Successfully cleaned up ${result.deletedCount} expired tokens`,
      };
    } else {
      throw new BadRequestException(`Token cleanup failed: ${result.error}`);
    }
  }
}
