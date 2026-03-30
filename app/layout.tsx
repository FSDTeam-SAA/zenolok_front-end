import type { Metadata } from "next";
import { Dongle, Poppins } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { RootShell } from "@/components/layout/root-shell";
import { Providers } from "@/app/providers";

const dongle = Dongle({
  subsets: ["latin"],
  variable: "--font-dongle",
  weight: ["300", "400", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zenolok",
  description: "Zenolok task and event manager",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dongle.variable} ${poppins.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const raw = localStorage.getItem("zenolok.preferences");
              if (!raw) return;
              const parsed = JSON.parse(raw);
              const darkMode = Boolean(parsed && parsed.darkMode);
              document.documentElement.classList.toggle("theme-dark", darkMode);
              document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
              document.body && document.body.classList.toggle("theme-dark", darkMode);
            } catch {}
          })();`}
        </Script>
        <Providers>
          <RootShell>{children}</RootShell>
        </Providers>
      </body>
    </html>
  );
}
