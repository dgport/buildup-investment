export interface GoogleUser {
  googleId: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar?: string;
}

export interface GoogleRequest extends Request {
  user: GoogleUser;
}
