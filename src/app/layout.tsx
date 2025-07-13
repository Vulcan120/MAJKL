import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TubeThemeProvider } from "@/contexts/tube-theme-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Tubler",
  description:
    "Collaboratively explore the London tube map on the Solana blockchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TubeThemeProvider>
            <WalletProvider>
              {children}
              <Toaster />
            </WalletProvider>
          </TubeThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
