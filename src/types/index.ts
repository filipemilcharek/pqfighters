import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      studentType: string;
      belt: string;
      degrees: number;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    studentType: string;
    belt: string;
    degrees: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    studentType: string;
    belt: string;
    degrees: number;
  }
}
