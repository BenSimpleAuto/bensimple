export default function robots() {
  const production = process.env.VERCEL_ENV === "production";
  return {
    rules: production
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: production ? "https://www.bensimple.co/sitemap.xml" : undefined
  };
}
