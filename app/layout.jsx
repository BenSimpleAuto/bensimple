import "./globals.css";
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800-italic.css";

export const metadata = {
  title: "BenSimple AI | Automotive Help in Butte, Montana",
  description: "Start with BenSimple AI for vehicle help, trades, VIN decoding, recall information, inventory guidance, and an appointment request with Ben LaVelle at Butte Auto.",
  metadataBase: new URL("https://www.bensimple.co"),
  openGraph: {
    title: "BenSimple",
    description: "A smarter first automotive conversation with Ben LaVelle in Butte, Montana.",
    url: "https://www.bensimple.co",
    siteName: "BenSimple",
    type: "website"
  }
};

export const viewport = {
  themeColor: "#0b0d0c",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
