import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import FleetNavbar from "./components/FleetNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cruising Fleet Portal",
  description: "Main Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          {/* UPDATED: Added currentApp="portal" so the navbar knows who it is */}
          <FleetNavbar currentApp="portal" />

          {/* Main wrapper with padding to prevent Navbar overlap */}
          <main className="pt-14 min-h-screen">
            {children}
          </main>

        </ThemeProvider>
      </body>
    </html>
  );
}