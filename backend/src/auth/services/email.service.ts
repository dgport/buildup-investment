import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  adminAlertEmailTemplate,
  listingStatusEmailTemplate,
  addPasswordEmailTemplate,
  resetPasswordEmailTemplate,
  verificationEmailTemplate,
} from '../templates/email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;
  private readonly adminEmail: string | null;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.get<string>('EMAIL_FROM') ?? 'onboarding@resend.dev';
    this.adminEmail =
      config.get<string>('ADMIN_NOTIFY_EMAIL') ??
      config.get<string>('ADMIN_EMAIL') ??
      null;
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

  /** Owner notification after an admin approves or rejects a listing. */
  async sendListingStatusEmail(
    email: string,
    firstname: string,
    title: string,
    status: 'APPROVED' | 'REJECTED',
    reason: string | null,
    url: string,
  ): Promise<void> {
    const approved = status === 'APPROVED';
    await this.send(
      email,
      approved
        ? `✅ თქვენი განცხადება გამოქვეყნდა — ${title}`
        : `⚠️ განცხადება საჭიროებს შესწორებას — ${title}`,
      listingStatusEmailTemplate(firstname, title, approved, reason, url),
    );
  }

  /**
   * Best-effort alert to the site admin (ADMIN_NOTIFY_EMAIL, falling back to
   * ADMIN_EMAIL). Silently skipped when neither is configured.
   */
  async sendAdminAlert(
    subject: string,
    rows: { label: string; value: string }[],
    actionLabel: string,
    actionUrl: string,
  ): Promise<void> {
    if (!this.adminEmail) return;
    await this.send(
      this.adminEmail,
      subject,
      adminAlertEmailTemplate(subject, rows, actionLabel, actionUrl),
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
