import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
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
  private readonly resend?: Resend;
  private readonly provider: 'resend' | 'sendly';
  private readonly sendlyKey?: string;
  private readonly from: string;
  private readonly adminEmail: string | null;

  constructor(private readonly config: ConfigService) {
    const provider = config.get<string>('EMAIL_PROVIDER') ?? 'resend';
    if (provider !== 'resend' && provider !== 'sendly') {
      throw new Error('EMAIL_PROVIDER must be resend or sendly');
    }
    this.provider = provider;
    if (provider === 'sendly') {
      this.sendlyKey = config.getOrThrow<string>('SENDLY_EMAIL_KEY');
      this.from = config.getOrThrow<string>('EMAIL_FROM');
    } else {
      this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
      this.from = config.get<string>('EMAIL_FROM') ?? 'onboarding@resend.dev';
    }
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
    required = false,
  ): Promise<void> {
    if (!this.adminEmail) {
      if (required) throw new ServiceUnavailableException('Contact email is not configured');
      return;
    }
    await this.send(
      this.adminEmail,
      subject,
      adminAlertEmailTemplate(subject, rows, actionLabel, actionUrl),
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const message = { from: this.from, to, subject, html };
      if (this.provider === 'sendly') {
        const response = await fetch(
          'https://app.sendly.ge/api/v1/email/send',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.sendlyKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
            signal: AbortSignal.timeout(15_000),
            redirect: 'error',
          },
        );
        if (response.status !== 202) {
          this.logger.warn(`Sendly rejected email: HTTP ${response.status}`);
          throw new Error('Sendly rejected email');
        }
        const result = (await response.json()) as {
          id?: unknown;
          status?: unknown;
        } | null;
        if (
          !result ||
          typeof result.id !== 'string' ||
          !result.id ||
          result.status !== 'queued'
        ) {
          throw new Error('Unexpected Sendly response');
        }
      } else {
        const { error } = await this.resend!.emails.send(message);
        if (error) throw new Error('Resend rejected email');
      }
      this.logger.log(`Email accepted by ${this.provider}: "${subject}"`);
    } catch {
      this.logger.error(`Email submission failed (${this.provider})`);
      throw new ServiceUnavailableException({
        code: 'EMAIL_UNAVAILABLE',
        message:
          'Email delivery is temporarily unavailable. Please try again later.',
      });
    }
  }
}
