const year = new Date().getFullYear();

const baseWrapper = (
  headerColor: string,
  headerContent: string,
  body: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:40px 40px 20px 40px;text-align:center;background:${headerColor};border-radius:8px 8px 0 0;">
              ${headerContent}
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px;background-color:#f8f9fa;border-radius:0 0 8px 8px;">
              <p style="margin:0;color:#999999;font-size:12px;">© ${year} BuildUp. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const actionButton = (href: string, color: string, label: string) => `
<table role="presentation" style="width:100%;border-collapse:collapse;margin:30px 0;">
  <tr>
    <td align="center">
      <a href="${href}" style="display:inline-block;padding:14px 40px;background:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
        ${label}
      </a>
    </td>
  </tr>
</table>
<p style="margin:20px 0;color:#666666;font-size:14px;">If the button doesn't work, copy and paste this link:</p>
<p style="margin:0 0 20px 0;padding:12px;background-color:#f8f9fa;border-radius:4px;word-break:break-all;">
  <a href="${href}" style="color:#667eea;text-decoration:none;font-size:14px;">${href}</a>
</p>`;

const expiryNote = (text: string) => `
<div style="margin:30px 0;padding:16px;background-color:#fff3cd;border-left:4px solid #ffc107;border-radius:4px;">
  <p style="margin:0;color:#856404;font-size:14px;">⏰ <strong>Note:</strong> ${text}</p>
</div>`;

export function verificationEmailTemplate(
  firstname: string,
  url: string,
): string {
  const header = `<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">Welcome to BuildUp! 🎉</h1>`;
  const body = `
    <h2 style="margin:0 0 20px 0;color:#333333;font-size:24px;">Hi ${firstname},</h2>
    <p style="margin:0 0 20px 0;color:#666666;font-size:16px;line-height:1.6;">
      Thank you for signing up! Please verify your email address to get started.
    </p>
    ${actionButton(url, 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', 'Verify Email Address')}
    ${expiryNote('This verification link will expire in 24 hours.')}`;

  return baseWrapper(
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    header,
    body,
  );
}

export function resetPasswordEmailTemplate(url: string): string {
  const header = `<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">🔐 Password Reset</h1>`;
  const body = `
    <h2 style="margin:0 0 20px 0;color:#333333;font-size:24px;">Reset Your Password</h2>
    <p style="margin:0 0 20px 0;color:#666666;font-size:16px;line-height:1.6;">
      We received a request to reset your password. Click below to create a new one.
    </p>
    ${actionButton(url, 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)', 'Reset Password')}
    ${expiryNote('This link will expire in 1 hour.')}
    <div style="margin:20px 0;padding:16px;background-color:#f8d7da;border-left:4px solid #dc3545;border-radius:4px;">
      <p style="margin:0;color:#721c24;font-size:14px;">🛡️ If you didn't request this, please ignore this email.</p>
    </div>`;

  return baseWrapper(
    'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    header,
    body,
  );
}

export function addPasswordEmailTemplate(
  firstname: string,
  url: string,
): string {
  const header = `<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">🔑 Add Password</h1>`;
  const body = `
    <h2 style="margin:0 0 20px 0;color:#333333;font-size:24px;">Hi ${firstname},</h2>
    <p style="margin:0 0 20px 0;color:#666666;font-size:16px;line-height:1.6;">
      You requested to add a password to your account, allowing sign-in with email and password in addition to Google.
    </p>
    ${actionButton(url, 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', 'Set Your Password')}
    ${expiryNote('This link will expire in 1 hour.')}`;

  return baseWrapper(
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    header,
    body,
  );
}
