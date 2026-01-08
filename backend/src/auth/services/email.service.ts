import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.getOrThrow<string>('EMAIL_USER'),
        pass: this.config.getOrThrow<string>('EMAIL_APP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(email: string, firstname: string, token: string) {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from:
        this.config.get<string>('EMAIL_FROM') ||
        this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: '✉️ Verify Your Email Address - BuildUp',
      html: this.getVerificationEmailTemplate(firstname, verificationUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendUpdatePasswordEmail(email: string, token: string) {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const resetPasswordUrl = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from:
        this.config.get<string>('EMAIL_FROM') ||
        this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: '🔐 Reset Your Password - BuildUp',
      html: this.getPasswordResetEmailTemplate(resetPasswordUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return 'Password reset email sent successfully';
  }

  async sendAddPasswordEmail(email: string, firstname: string, token: string) {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const addPasswordUrl = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from:
        this.config.get<string>('EMAIL_FROM') ||
        this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: '🔑 Add Password to Your Account - BuildUp',
      html: this.getAddPasswordEmailTemplate(firstname, addPasswordUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Add password email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Error sending add password email:', error);
      throw new Error('Failed to send add password email');
    }
  }

  private getVerificationEmailTemplate(
    firstname: string,
    verificationUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to BuildUp! 🎉</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hi ${firstname},</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Thank you for signing up! We're excited to have you on board. To get started, please verify your email address by clicking the button below.
                    </p>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    
                    <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all;">
                      <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">${verificationUrl}</a>
                    </p>
                    
                    <div style="margin: 30px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 14px;">
                        ⏰ <strong>Note:</strong> This verification link will expire in 24 hours.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; line-height: 1.6;">
                      If you didn't create an account with BuildUp, you can safely ignore this email.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} BuildUp. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(resetPasswordUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Password Reset</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetPasswordUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    
                    <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all;">
                      <a href="${resetPasswordUrl}" style="color: #f5576c; text-decoration: none; font-size: 14px;">${resetPasswordUrl}</a>
                    </p>
                    
                    <div style="margin: 30px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 14px;">
                        ⏰ <strong>Note:</strong> This password reset link will expire in 1 hour for security reasons.
                      </p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 16px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
                      <p style="margin: 0; color: #721c24; font-size: 14px;">
                        🛡️ <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; line-height: 1.6;">
                      This is an automated email. Please do not reply to this message.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} BuildUp. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getAddPasswordEmailTemplate(
    firstname: string,
    addPasswordUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Add Password to Your Account</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔑 Add Password</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hi ${firstname},</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      You requested to add a password to your account. This will allow you to sign in with your email and password in addition to Google.
                    </p>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${addPasswordUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Set Your Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    
                    <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all;">
                      <a href="${addPasswordUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">${addPasswordUrl}</a>
                    </p>
                    
                    <div style="margin: 30px 0; padding: 16px; background-color: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
                      <p style="margin: 0 0 8px 0; color: #0d47a1; font-size: 14px; font-weight: 600;">
                        ℹ️ What happens after you add a password?
                      </p>
                      <p style="margin: 0; color: #1565c0; font-size: 14px;">
                        You'll be able to sign in using either Google or your email and password. Your existing Google sign-in will continue to work.
                      </p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 14px;">
                        ⏰ <strong>Note:</strong> This link will expire in 1 hour for security reasons.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; line-height: 1.6;">
                      If you didn't request this, please ignore this email or contact our support team.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} BuildUp. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
