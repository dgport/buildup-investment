import { UserAccountService } from './user-account.service';
import { AuthMethod } from '@prisma/client';
import { hash, verify } from 'argon2';

describe('Account recovery and sign-in', () => {
  let service: UserAccountService;
  let prisma: any;
  let mail: any;
  const account = {
    id: 'user-1',
    email: 'owner@example.com',
    firstname: 'Owner',
    lastname: 'Example',
    isActive: true,
    isVerified: true,
    method: AuthMethod.CREDENTIALS,
  };
  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      account: { findUnique: jest.fn(), upsert: jest.fn() },
      session: { updateMany: jest.fn() },
    };
    prisma.$transaction = jest.fn((fn) => fn(prisma));
    mail = {
      sendVerificationEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
      sendAddPasswordEmail: jest.fn(),
    };
    service = new UserAccountService(prisma, mail);
  });
  it('reports a failed verification delivery while preserving the new account for resend', async () => {
    prisma.user.create.mockResolvedValue(account);
    mail.sendVerificationEmail.mockRejectedValue(
      new Error('provider unavailable'),
    );
    const result = await service.createUserWithCredentials({
      ...account,
      password: 'Example#123',
    });
    expect(result.verificationEmailSent).toBe(false);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });
  it('does not reveal whether an unknown email exists in recovery responses', async () => {
    const absent = await service.sendUpdatePasswordEmail(account.email);
    prisma.user.findUnique.mockResolvedValue({
      ...account,
      password: 'hashed',
    });
    expect(await service.sendUpdatePasswordEmail(account.email)).toEqual(
      absent,
    );
    expect(mail.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
  });
  it('reports email delivery failure instead of claiming a reset link was sent', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...account,
      password: 'hashed',
    });
    mail.sendResetPasswordEmail.mockRejectedValue(new Error('unavailable'));
    await expect(
      service.sendUpdatePasswordEmail(account.email),
    ).rejects.toThrow('unavailable');
  });
  it('rejects inactive accounts before issuing credentials or linking Google', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...account, isActive: false });
    await expect(
      service.validateCredentials(account.email, 'anything'),
    ).rejects.toThrow();
    await expect(
      service.signupOrLoginWithGoogle({ ...account, googleId: 'g-1' }),
    ).rejects.toThrow();
    await expect(service.findById(account.id)).rejects.toThrow();
    expect(prisma.account.upsert).not.toHaveBeenCalled();
  });
  it('verifies the password before exposing an unverified email state', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...account,
      isVerified: false,
      password: await hash('Example#123'),
    });
    await expect(
      service.validateCredentials(account.email, 'Wrong#123'),
    ).rejects.toThrow('Invalid credentials');
    await expect(
      service.validateCredentials(account.email, 'Example#123'),
    ).rejects.toThrow('verify your email');
  });
  it('consumes verification tokens atomically and rejects reuse', async () => {
    prisma.user.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    await expect(service.verifyEmail('token')).resolves.toHaveProperty(
      'message',
    );
    await expect(service.verifyEmail('token')).rejects.toThrow(
      'Invalid or expired',
    );
    expect(prisma.user.updateMany.mock.calls[0][0].where).toMatchObject({
      isVerified: false,
      isActive: true,
      emailVerificationExpires: { gt: expect.any(Date) },
    });
  });
  it('consumes reset tokens once, verifies the email and revokes existing refresh sessions', async () => {
    prisma.user.findFirst.mockResolvedValue({
      ...account,
      method: AuthMethod.GOOGLE,
      password: null,
    });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    await service.updatePassword({
      token: 'token',
      password: 'NewPassword#123',
    });
    const update = prisma.user.updateMany.mock.calls[0][0];
    expect(update.where).toMatchObject({
      resetPasswordToken: 'token',
      isActive: true,
    });
    expect(update.data).toMatchObject({
      isVerified: true,
      resetPasswordToken: null,
      method: AuthMethod.BOTH,
    });
    expect(await verify(update.data.password, 'NewPassword#123')).toBe(true);
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { userId: account.id, isRevoked: false },
      data: { isRevoked: true },
    });
  });
  it('rejects a reset token consumed by another request during hashing', async () => {
    prisma.user.findFirst.mockResolvedValue(account);
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.updatePassword({ token: 'token', password: 'Example#123' }),
    ).rejects.toThrow('Invalid or expired');
    expect(prisma.session.updateMany).not.toHaveBeenCalled();
  });
  it('rejects an expired reset token', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.updatePassword({ token: 'expired', password: 'Example#123' }),
    ).rejects.toThrow('Invalid or expired');
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
  it('does not activate a password from an unverified signup when Google proves email ownership', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...account, isVerified: false, password: 'unknown-password-hash' });
    prisma.user.update.mockResolvedValue({ ...account, method: AuthMethod.GOOGLE, password: null });
    await service.signupOrLoginWithGoogle({ ...account, googleId: 'g-1' });
    expect(prisma.user.update.mock.calls[0][0].data).toMatchObject({ isVerified: true, method: AuthMethod.GOOGLE, password: null });
  });
});
