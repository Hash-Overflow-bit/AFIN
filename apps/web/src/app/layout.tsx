import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AFIN | African Fixed Income Network",
  description: "Digital government bond exchange platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} font-sans antialiased min-h-screen bg-surface-canvas-dark text-on-primary`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
