import { User } from './user.type';

export class RefreshTokenResponse {
  accessToken: string;
  user: User;
}
