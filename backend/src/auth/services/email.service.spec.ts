import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { EmailService } from './email.service';

const mockResendSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest
    .fn()
    .mockImplementation(() => ({ emails: { send: mockResendSend } })),
}));

describe('Email provider delivery contract', () => {
  let fetchMock: jest.SpyInstance;
  const make = (extra: Record<string, string> = {}) =>
    new EmailService(
      new ConfigService({
        EMAIL_PROVIDER: 'sendly',
        SENDLY_EMAIL_KEY: 'test-key',
        EMAIL_FROM: 'noreply@buildup.ge',
        FRONTEND_URL: 'https://buildup.ge',
        ...extra,
      }),
    );
  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
    mockResendSend.mockReset();
  });
  afterEach(() => jest.restoreAllMocks());

  it('sends the existing verification template and accepts only queued responses', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: 'msg-1', status: 'queued' }), {
        status: 202,
      }),
    );
    await make().sendVerificationEmail('owner@example.com', 'Anna', 'abc');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://app.sendly.ge/api/v1/email/send');
    expect(options.headers.Authorization).toBe('Bearer test-key');
    expect(options.redirect).toBe('error');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(options.body)).toMatchObject({
      from: 'noreply@buildup.ge',
      to: 'owner@example.com',
      html: expect.stringContaining(
        'https://buildup.ge/verify-email?token=abc',
      ),
    });
    expect(mockResendSend).not.toHaveBeenCalled();
  });
  it.each([401, 402, 403, 429, 500])(
    'surfaces HTTP %s as mail unavailability',
    async (status) => {
      fetchMock.mockResolvedValue(new Response('{}', { status }));
      await expect(
        make().sendResetPasswordEmail('owner@example.com', 'abc'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(mockResendSend).not.toHaveBeenCalled();
    },
  );
  it.each(['{}', 'null', '{"id":"msg-1","status":"failed"}', 'invalid json'])(
    'rejects an invalid acknowledgement %s',
    async (body) => {
      fetchMock.mockResolvedValue(new Response(body, { status: 202 }));
      await expect(
        make().sendResetPasswordEmail('owner@example.com', 'abc'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    },
  );
  it('does not retry a timed out request', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'));
    await expect(
      make().sendResetPasswordEmail('owner@example.com', 'abc'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockResendSend).not.toHaveBeenCalled();
  });
  it('keeps Resend working when selected', async () => {
    mockResendSend.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
    await make({
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 'test-resend',
    }).sendResetPasswordEmail('owner@example.com', 'abc');
    expect(mockResendSend).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('routes required website messages to the configured recipient', async () => {
    mockResendSend.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
    await make({ EMAIL_PROVIDER: 'resend', RESEND_API_KEY: 'test', ADMIN_NOTIFY_EMAIL: 'info@buildup.ge' })
      .sendAdminAlert('Contact', [{ label: 'Message', value: '<script>alert(1)</script>' }], 'Reply', 'mailto:sender@example.com', true);
    expect(mockResendSend.mock.calls[0][0].to).toBe('info@buildup.ge');
    expect(mockResendSend.mock.calls[0][0].html).not.toContain('<script>');
  });
  it('does not report success when the contact recipient is missing', async () => {
    await expect(make().sendAdminAlert('Contact', [], 'Reply', 'mailto:a@example.com', true))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(mockResendSend).not.toHaveBeenCalled();
  });
  it('fails startup on an unknown provider', () => {
    expect(() => make({ EMAIL_PROVIDER: 'typo' })).toThrow('EMAIL_PROVIDER');
  });
});
