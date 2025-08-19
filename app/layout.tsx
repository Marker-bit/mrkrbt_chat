import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Fira_Code, Inter } from "next/font/google";
import "./globals.css";
import { ColorProvider } from "@/components/color-provider";
import ViewportResizeProvider from "@/components/viewport-resize-provider";
import Head from "next/head";

const mainFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const codeFont = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mrkrbt.chat",
  description: "A clone of T3 Chat",
  applicationName: "mrkrbt.chat",
  appleWebApp: {
    capable: true,
    title: "mrkrbt.chat",
  },
};

export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mainFont.className} ${codeFont.variable} antialiased font-sans overflow-hidden `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ColorProvider>
            <ViewportResizeProvider>
              <Toaster />
              {children}
            </ViewportResizeProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
