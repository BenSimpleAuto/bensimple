import "./globals.css";
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800-italic.css";

export const metadata = {
  title: "BenSimple | Cars don't have to be complicated.",
  description: "Ben LaVelle at Butte Auto. Buy, trade, find, compare, and understand your next vehicle without the pressure.",
  metadataBase: new URL("https://www.bensimple.co"),
  openGraph: {
    title: "BenSimple",
    description: "Cars don't have to be complicated.",
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
