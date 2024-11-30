import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Social Media Campaign Automation',
  description: 'AI-powered social media campaign management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
