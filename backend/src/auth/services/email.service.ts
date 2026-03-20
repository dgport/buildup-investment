import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  addPasswordEmailTemplate,
  resetPasswordEmailTemplate,
  verificationEmailTemplate,
} from '../templates/email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.get<string>('EMAIL_FROM') ?? 'onboarding@resend.dev';
  }

  async sendVerificationEmail(
    email: string,
    firstname: string,
    token: string,
  ): Promise<void> {
    const url = `${this.config.getOrThrow<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.send(
      email,
      '✉️ Verify Your Email - BuildUp',
      verificationEmailTemplate(firstname, url),
    );
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.send(
      email,
      '🔐 Reset Your Password - BuildUp',
      resetPasswordEmailTemplate(url),
    );
  }

  async sendAddPasswordEmail(
    email: string,
    firstname: string,
    token: string,
  ): Promise<void> {
    const url = `${this.config.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.send(
      email,
      '🔑 Add Password to Your Account - BuildUp',
      addPasswordEmailTemplate(firstname, url),
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      if (error) throw new Error(error.message);
      this.logger.log(`Email sent: "${subject}" → ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: "${subject}" → ${to}`, error);
      throw new Error('Failed to send email');
    }
  }
}
