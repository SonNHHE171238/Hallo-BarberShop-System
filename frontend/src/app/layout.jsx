import { Playfair_Display, Montserrat, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "HALLO BARBER | Premium Grooming for Men",
  description: "Sự chính xác trong từng đường cắt. Nơi định hình phong cách quý ông hiện đại.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md bg-surface text-on-surface antialiased overflow-x-hidden selection:bg-primary selection:text-on-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
