import { Hanken_Grotesk } from "next/font/google";
import "../globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
});

export const metadata = {
  title: "faixappreta - Super Admin",
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${hanken.variable} font-hanken antialiased bg-surface-primary text-content-primary`}>
        {children}
      </body>
    </html>
  );
}
