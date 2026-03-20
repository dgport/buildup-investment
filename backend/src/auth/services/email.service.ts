import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  addPasswordEmailTemplate,
  resetPasswordEmailTemplate,
  verificationEmailTemplate,
} from '../templates/email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.getOrThrow<string>('EMAIL_USER'),
        pass: config.getOrThrow<string>('EMAIL_APP_PASSWORD'),
      },
    });

    this.from =
      config.get<string>('EMAIL_FROM') ??
      config.getOrThrow<string>('EMAIL_USER');
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
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent: "${subject}" → ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: "${subject}" → ${to}`, error);
      throw new Error('Failed to send email');
    }
  }
}
