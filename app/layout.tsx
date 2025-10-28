import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Email Classifier - AI-Powered Gmail Classification",
  description: "Classify your Gmail emails using AI. Automatically categorize emails into Important, Promotional, Social, Marketing, Spam, and General categories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
