import { IsStrongPassword, IsString, MaxLength } from 'class-validator';

export class UpdatePasswordInput {
  @IsString()
  token: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    },
  )
  @MaxLength(128)
  password: string;
}
