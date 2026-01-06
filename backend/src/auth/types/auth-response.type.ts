import { User } from './user.type';

export class AuthResponse {
  user: User;
  accessToken: string;
}
