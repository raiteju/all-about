"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

// 👇 Load Inter with next/font (self-hosted, no layout shift)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isExcluded, setIsExcluded] = useState(false);

  useEffect(() => {
    const excluded =
      pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    setIsExcluded(excluded);
  }, [pathname]);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <html lang="en" className={inter.variable}>
        <body suppressHydrationWarning>
          {!isExcluded && (
            <header>
              <Navbar />
            </header>
          )}
          <main>{children}</main>
          {!isExcluded && <Footer />}
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}