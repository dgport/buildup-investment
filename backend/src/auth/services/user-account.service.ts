import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { hash, verify } from 'argon2';
import * as crypto from 'crypto';
import { SignupRequest } from '../dto/signup.dto';
import { UpdatePasswordInput } from '../dto/update-password.dto';
import { GoogleUser } from '../types/google-request.type';
import { User } from '../types/user.type';
import { EmailService } from './email.service';

const VERIFICATION_EXPIRES_HOURS = 24;
const RESET_TOKEN_EXPIRES_MINUTES = 60;

const USER_SELECT = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  role: true,
  isVerified: true,
  isActive: true,
  avatar: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  method: true,
  password: false,
} as const;

@Injectable()
export class UserAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // ─── Registration ─────────────────────────────────────────────────────────────

  async createUserWithCredentials(dto: SignupRequest): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      const hint =
        existing.method === AuthMethod.GOOGLE
          ? 'Please sign in with Google instead.'
          : 'Please sign in with your password.';
      throw new ConflictException(
        `An account with this email already exists. ${hint}`,
      );
    }

    const { token, expires } = this.generateExpiringToken(
      VERIFICATION_EXPIRES_HOURS * 60,
    );

    const user = await this.prisma.user.create({
      data: {
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        password: await hash(dto.password),
        avatar: dto.avatar,
        phone: dto.phone,
        method: AuthMethod.CREDENTIALS,
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
      select: USER_SELECT,
    });

    // Fire-and-forget — don't block signup if email fails
    this.emailService
      .sendVerificationEmail(user.email, user.firstname, token)
      .catch(() => null);

    return user as User;
  }

  async signupOrLoginWithGoogle(googleUser: GoogleUser): Promise<User> {
    const { email, firstname, lastname, avatar, googleId } = googleUser;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          avatar: avatar ?? user.avatar,
          isVerified: true,
          ...(user.method === AuthMethod.CREDENTIALS && {
            method: AuthMethod.BOTH,
          }),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          firstname,
          lastname,
          email,
          avatar,
          password: null,
          method: AuthMethod.GOOGLE,
          isVerified: true,
        },
      });
    }

    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId,
        },
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleId,
        expiresAt: this.oauthExpiresAt(),
        tokenType: 'Bearer',
        scope: 'email profile',
      },
      update: { expiresAt: this.oauthExpiresAt() },
    });

    return this.findById(user.id);
  }

  // ─── Authentication ───────────────────────────────────────────────────────────

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created with Google. Please sign in with Google or add a password.',
      );
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in.',
      );
    }

    if (!(await verify(user.password, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      select: USER_SELECT,
    }) as Promise<User>;
  }

  // ─── Email Verification ───────────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
        isVerified: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified)
      throw new BadRequestException('Email is already verified');

    const { token, expires } = this.generateExpiringToken(
      VERIFICATION_EXPIRES_HOURS * 60,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstname,
      token,
    );

    return { message: 'Verification email sent successfully' };
  }

  // ─── Password Management ──────────────────────────────────────────────────────

  async sendUpdatePasswordEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User not found');

    const { token, expires } = this.generateExpiringToken(
      RESET_TOKEN_EXPIRES_MINUTES,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordTokenExpires: expires },
    });

    if (user.password) {
      await this.emailService.sendResetPasswordEmail(email, token);
      return { message: 'Password reset link sent to your email' };
    } else {
      await this.emailService.sendAddPasswordEmail(
        email,
        user.firstname,
        token,
      );
      return { message: 'Add password link sent to your email' };
    }
  }

  async updatePassword(dto: UpdatePasswordInput): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordTokenExpires: { gt: new Date() },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid or expired token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(dto.password),
        method:
          !user.password && user.method === AuthMethod.GOOGLE
            ? AuthMethod.BOTH
            : user.method,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
      },
    });
  }

  // ─── Lookup ───────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) throw new NotFoundException('User not found');

    return user as User;
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private generateExpiringToken(minutes: number): {
    token: string;
    expires: Date;
  } {
    return {
      token: crypto.randomBytes(32).toString('hex'),
      expires: new Date(Date.now() + minutes * 60 * 1000),
    };
  }

  private oauthExpiresAt(): number {
    return Math.floor(Date.now() / 1000) + 3600;
  }
}
