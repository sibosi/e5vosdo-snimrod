import { Fira_Code as FontMono, Redacted_Script as FontSans } from "next/font/google";

export const fontSans = FontSans({
  display: "swap",
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
