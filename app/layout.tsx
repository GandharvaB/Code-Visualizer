import type { Metadata } from 'next';
import { Space_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jbMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono' });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ['latin'], variable: '--font-spacemono' });

export const metadata: Metadata = {
  title: 'CodeTutor: Code Visualizer',
  description: 'Understand Any Code, Instantly. Interactive code flowcharts and AST explorer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="github-dark" suppressHydrationWarning>
      <body className={`${jbMono.variable} ${spaceMono.variable} antialiased h-screen w-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
