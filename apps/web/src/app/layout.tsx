import type { Metadata } from "next";
import { Rubik, Quicksand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["400", "500", "600", "700"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "AGBX | African Government Bond Exchange",
  description: "Digital government bond exchange platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} ${quicksand.variable} font-sans antialiased min-h-screen bg-[#ffffff] dark:bg-[#0a0514] text-[#1f1633] dark:text-[#ffffff] transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
