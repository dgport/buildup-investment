import { IsString } from 'class-validator';

export class UpdatePasswordInput {
  @IsString()
  token: string;

  @IsString()
  password: string;
}
