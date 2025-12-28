import { Montserrat, Playfair_Display, Source_Code_Pro } from "next/font/google";

const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["system-ui", "arial"],
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  fallback: ["Georgia", "serif"],
});

const fontMono = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
  fallback: ["Courier New", "monospace"],
});

export const fonts = [fontSans.variable, fontSerif.variable, fontMono.variable];
