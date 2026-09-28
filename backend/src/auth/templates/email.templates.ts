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
        <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
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

function accountEmail(
  title: string,
  englishTitle: string,
  body: string,
  url: string,
  button: string,
  expiry: string,
): string {
  const safeUrl = escapeHtml(url);
  return baseWrapper(
    '#042f2e',
    `<h1 style="margin:0;color:#ffffff;font-size:24px;">BuildUp</h1>`,
    `
    <h2 style="margin:0 0 12px;color:#042f2e;font-size:24px;">${title}</h2>
    <p style="color:#64748b;font-size:14px;">${englishTitle}</p>
    <p style="color:#334155;font-size:16px;line-height:1.7;">${body}</p>
    ${actionButton(safeUrl, '#0f766e', button)}
    ${expiryNote(expiry)}
    <p style="color:#64748b;font-size:13px;line-height:1.6;">თუ ეს მოთხოვნა თქვენ არ გაგიგზავნიათ, უგულებელყავით წერილი.<br>If you did not request this, ignore this email.</p>`,
  );
}

export function verificationEmailTemplate(
  firstname: string,
  url: string,
): string {
  return accountEmail(
    'დაადასტურეთ ელ-ფოსტა',
    'Verify your email address',
    `გამარჯობა, ${escapeHtml(firstname)}! რეგისტრაციის დასასრულებლად დაადასტურეთ თქვენი ელ-ფოსტა.<br>Confirm your email to finish creating your account.`,
    url,
    'დადასტურება / Verify email',
    'ბმული მოქმედებს 24 საათი / This link expires in 24 hours.',
  );
}

export function resetPasswordEmailTemplate(url: string): string {
  return accountEmail(
    'პაროლის აღდგენა',
    'Reset your password',
    'ახალი პაროლის შესაქმნელად გამოიყენეთ ქვემოთ მოცემული ბმული.<br>Use the link below to choose a new password.',
    url,
    'პაროლის აღდგენა / Reset password',
    'ბმული მოქმედებს 1 საათი / This link expires in 1 hour.',
  );
}

export function addPasswordEmailTemplate(
  firstname: string,
  url: string,
): string {
  return accountEmail(
    'პაროლის დამატება',
    'Add a password',
    `გამარჯობა, ${escapeHtml(firstname)}! დაამატეთ პაროლი, რომ Google-ის გარდა ელ-ფოსტითაც შეხვიდეთ.<br>Add a password to sign in with email as well as Google.`,
    url,
    'პაროლის დამატება / Set password',
    'ბმული მოქმედებს 1 საათი / This link expires in 1 hour.',
  );
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function listingStatusEmailTemplate(
  firstname: string,
  title: string,
  approved: boolean,
  reason: string | null,
  url: string,
): string {
  const gradient = approved
    ? 'linear-gradient(135deg,#134e4a 0%,#0f766e 100%)'
    : 'linear-gradient(135deg,#7c2d12 0%,#b45309 100%)';
  const header = `<h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;">${
    approved ? '✅ განცხადება გამოქვეყნდა' : '⚠️ განცხადება უარყოფილია'
  }</h1>`;
  const body = `
    <h2 style="margin:0 0 20px 0;color:#333333;font-size:22px;">გამარჯობა, ${escapeHtml(firstname)}</h2>
    <p style="margin:0 0 16px 0;color:#666666;font-size:16px;line-height:1.6;">
      თქვენი განცხადება <strong>„${escapeHtml(title)}"</strong> ${
        approved
          ? 'შემოწმდა და უკვე ჩანს საიტზე.'
          : 'შემოწმდა, მაგრამ ამ ეტაპზე ვერ გამოქვეყნდება.'
      }
    </p>
    ${
      !approved && reason
        ? `<div style="margin:20px 0;padding:16px;background-color:#fff7ed;border-left:4px solid #f59e0b;border-radius:4px;">
      <p style="margin:0 0 6px 0;color:#9a3412;font-size:13px;font-weight:600;">მიზეზი</p>
      <p style="margin:0;color:#7c2d12;font-size:14px;line-height:1.5;">${escapeHtml(reason)}</p>
    </div>`
        : ''
    }
    <p style="margin:0 0 20px 0;color:#666666;font-size:15px;line-height:1.6;">
      ${
        approved
          ? 'შეგიძლიათ ნახოთ, გააზიაროთ ან ნებისმიერ დროს დაარედაქტიროთ პროფილიდან.'
          : 'შეასწორეთ განცხადება პროფილიდან — შენახვის შემდეგ ის ავტომატურად დაბრუნდება განსახილველად.'
      }
    </p>
    ${actionButton(url, gradient, approved ? 'განცხადების ნახვა' : 'პროფილში გადასვლა')}`;

  return baseWrapper(gradient, header, body);
}

export function adminAlertEmailTemplate(
  title: string,
  rows: { label: string; value: string }[],
  actionLabel: string,
  actionUrl: string,
): string {
  const gradient = 'linear-gradient(135deg,#042f2e 0%,#134e4a 100%)';
  const header = `<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;">${escapeHtml(title)}</h1>`;
  const table = rows
    .map(
      (r) => `<tr>
        <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;line-height:1.5;">${escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join('');
  const body = `
    <table role="presentation" style="border-collapse:collapse;width:100%;margin:0 0 10px 0;">${table}</table>
    ${actionButton(actionUrl, gradient, actionLabel)}`;
  return baseWrapper(gradient, header, body);
}
