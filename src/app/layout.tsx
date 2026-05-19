import type { Metadata } from "next";
import { Teko, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const teko = Teko({ subsets: ["latin"], variable: "--font-teko" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PQ - Centro de Treinamento",
  description: "Sistema de agendamento de aulas de Jiu-Jitsu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${teko.variable} ${inter.variable} font-inter antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
