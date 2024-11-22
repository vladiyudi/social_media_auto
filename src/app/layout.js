import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Social Media Automation Dashboard',
  description: 'Manage your social media presence efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
