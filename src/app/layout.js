import './globals.css';

export const metadata = {
  title: 'TS-8 Capital',
  description: 'Portfolio dashboard and investment memo tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
