import { SessionOptions } from 'iron-session';

export interface AdminSessionData {
  isLoggedIn: boolean;
  username?: string;
}

export const defaultSession: AdminSessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  },
};
