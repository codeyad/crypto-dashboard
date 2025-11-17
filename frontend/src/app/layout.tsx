import "./globals.css";

export const metadata = {
  title: "Crypto Dashboard",
  description: "Real-time crypto rates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className="h-full bg-gray-900 text-gray-100">{children}</body>
    </html>
  );
}
