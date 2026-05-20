import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      studentType: string;
      modalities: string;
      belt: string;
      degrees: number;
      photoUrl?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    studentType: string;
    modalities: string;
    belt: string;
    degrees: number;
    photoUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    studentType: string;
    modalities: string;
    belt: string;
    degrees: number;
    photoUrl?: string | null;
  }
}
