import { DM_Serif_Text, Inter, Jost, Roboto_Mono } from 'next/font/google';

export const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-inter',
});

export const dmSerifText = DM_Serif_Text({
  display: 'swap',
  subsets: ['latin'],
  weight: '400',
  variable: '--font-family-dm-serif-text',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-roboto-mono',
});

// ELLE SHOP (elleshop.jp) uses Jost for headings/UI labels.
export const jost = Jost({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-family-jost',
});

export const fonts = [inter, dmSerifText, robotoMono, jost];
