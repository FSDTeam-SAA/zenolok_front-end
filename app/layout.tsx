import type { Metadata } from "next";
import { Dongle, Poppins } from "next/font/google";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dongle.variable} ${poppins.variable}`}>
        <Providers>
          <RootShell>{children}</RootShell>
        </Providers>
      </body>
    </html>
  );
}
