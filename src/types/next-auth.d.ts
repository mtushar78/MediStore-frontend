import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "customer" | "seller" | "admin";
      accessToken: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      name: string;
      email: string;
      role: "customer" | "seller" | "admin";
      accessToken: string;
    };
  }
}
