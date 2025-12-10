import { DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      id: string;
      stripeCustomerId: string | null;
      isActive: boolean;
      role: string;
    };
  }
  interface User extends DefaultUser {
    stripeCustomerId?: string | null;
    isActive?: boolean;
    password?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    stripeCustomerId?: string | null;
    isActive?: boolean;
    role?: string;
  }
}
