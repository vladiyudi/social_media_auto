import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Social Media Automation Dashboard',
  description: 'Manage your social media presence efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
