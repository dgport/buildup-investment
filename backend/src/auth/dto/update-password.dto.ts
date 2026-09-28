import {
  IsStrongPassword,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdatePasswordInput {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i)
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
