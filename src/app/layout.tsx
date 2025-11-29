// src/app/layout.tsx   ← This one stays a SERVER COMPONENT
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import { Analytics } from "@vercel/analytics/next";

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

        {/* Version Marker for Deployment Verification */}
        <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '5px', background: 'red', color: 'white', zIndex: 9999, fontSize: '12px' }}>
          v2.0 - Deployment Verified
        </div>

        <Analytics />
      </body>
    </html>
  );
}