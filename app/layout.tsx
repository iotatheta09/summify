import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";


const fontSans = FontSans({
  subsets:['latin'],
  variable:'--font-sans',
  weight:['200','300','400','500','600','700','800','900']
});



export const metadata: Metadata = {
  title: "Summify",
  description:
    "Summify is an AI-powered tool that generates concise summaries of long articles, making it easier for users to quickly grasp the main points and key information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" 
      
    >
      <body className={`${fontSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
