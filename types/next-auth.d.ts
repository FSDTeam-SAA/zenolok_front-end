import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
    user: DefaultSession["user"] & {
      _id: string;
      username: string;
      role: string;
      avatar?: {
        public_id: string;
        url: string;
      };
    };
  }

  interface User {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
    user: {
      _id: string;
      name?: string;
      email: string;
      username: string;
      role: string;
      avatar?: {
        public_id: string;
        url: string;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
    user: {
      _id: string;
      name?: string;
      email: string;
      username: string;
      role: string;
      avatar?: {
        public_id: string;
        url: string;
      };
    };
  }
}
