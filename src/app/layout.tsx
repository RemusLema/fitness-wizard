// src/app/layout.tsx   ← This one stays a SERVER COMPONENT
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Fitness Plan Wizard",
  description: "Your personalized fitness & nutrition plan in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}