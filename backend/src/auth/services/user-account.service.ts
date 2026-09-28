import {
  BadRequestException,
  ConflictException,
  Injectable,
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
  listingTermsVersion: true,
  listingTermsAcceptedAt: true,
  password: false,
} as const;

@Injectable()
export class UserAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createUserWithCredentials(
    dto: SignupRequest,
  ): Promise<User & { verificationEmailSent: boolean }> {
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

    let verificationEmailSent = true;
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstname,
        token,
      );
    } catch {
      verificationEmailSent = false;
    }
    return { ...user, verificationEmailSent } as User & {
      verificationEmailSent: boolean;
    };
  }

  async signupOrLoginWithGoogle(googleUser: GoogleUser): Promise<User> {
    const { email, firstname, lastname, avatar, googleId } = googleUser;

    const linkedAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId,
        },
      },
      include: { user: true },
    });
    let user =
      linkedAccount?.user ??
      (await this.prisma.user.findUnique({ where: { email } }));

    if (user) {
      if (!user.isActive)
        throw new UnauthorizedException('Account is inactive');
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          avatar: avatar ?? user.avatar,
          isVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
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

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created with Google. Please sign in with Google or add a password.',
      );
    }

    if (!(await verify(user.password, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in.',
      );
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      select: USER_SELECT,
    }) as Promise<User>;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const result = await this.prisma.user.updateMany({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
        isVerified: false,
        isActive: true,
      },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
    if (result.count !== 1)
      throw new BadRequestException('Invalid or expired verification token');

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const response = {
      message: 'If verification is needed, an email has been sent.',
    };
    if (!user || user.isVerified || !user.isActive) return response;

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

    return response;
  }

  async sendUpdatePasswordEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const response = {
      message:
        'If an active account exists, a password reset email has been sent.',
    };
    if (!user || !user.isActive) return response;

    const { token, expires } = this.generateExpiringToken(
      RESET_TOKEN_EXPIRES_MINUTES,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordTokenExpires: expires },
    });

    if (user.password) {
      await this.emailService.sendResetPasswordEmail(email, token);
    } else {
      await this.emailService.sendAddPasswordEmail(
        email,
        user.firstname,
        token,
      );
    }
    return response;
  }

  async updatePassword(dto: UpdatePasswordInput): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordTokenExpires: { gt: new Date() },
        isActive: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid or expired token');

    const password = await hash(dto.password);
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: user.id,
          resetPasswordToken: dto.token,
          resetPasswordTokenExpires: { gt: new Date() },
          isActive: true,
        },
        data: {
          password,
          isVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          method:
            !user.password && user.method === AuthMethod.GOOGLE
              ? AuthMethod.BOTH
              : user.method,
          resetPasswordToken: null,
          resetPasswordTokenExpires: null,
        },
      });
      if (updated.count !== 1)
        throw new UnauthorizedException('Invalid or expired token');
      await tx.session.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true },
      });
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user || !user.isActive)
      throw new UnauthorizedException('User not found or inactive');

    return user as User;
  }

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
