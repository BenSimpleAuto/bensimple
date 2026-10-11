import "./globals.css";
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800-italic.css";

export const metadata = {
  title: {
    default: "BenSimple | Automotive Help in Butte, Montana",
    template: "%s | BenSimple"
  },
  description: "Start with BenSimple AI for vehicle help, trades, VIN decoding, recall information, inventory guidance, and an appointment request with Ben LaVelle at Butte Auto.",
  metadataBase: new URL("https://www.bensimple.co"),
  applicationName: "BenSimple",
  authors: [{ name: "Ben LaVelle", url: "https://www.bensimple.co" }],
  creator: "Ben LaVelle",
  keywords: ["BenSimple", "Ben LaVelle", "Butte Montana car sales", "Butte Auto", "vehicle help Butte MT", "trade in Butte Montana", "VIN decode", "NHTSA recalls"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "BenSimple | Automotive Help in Butte, Montana",
    description: "Vehicle shopping, trade guidance, VIN decoding, NHTSA recall information, and appointment requests with Ben LaVelle.",
    url: "https://www.bensimple.co",
    siteName: "BenSimple",
    locale: "en_US",
    type: "website",
    images: [{ url: "/BEN_MASTER_BANNER_APPROVED.jpg", width: 1200, height: 630, alt: "BenSimple by Ben LaVelle in Butte, Montana" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "BenSimple | Automotive Help in Butte, Montana",
    description: "Cars do not have to be complicated. Start with Ben LaVelle and BenSimple.",
    images: ["/BEN_MASTER_BANNER_APPROVED.jpg"]
  },
  category: "automotive"
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
