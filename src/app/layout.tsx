import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebula Vision",
  description: "A high-end, futuristic 3D Spatial Interactive website",
  icons: {
    icon: "/logo.png?v=3",
    shortcut: "/logo.png?v=3",
    apple: "/logo.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
