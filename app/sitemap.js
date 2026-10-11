export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: "https://www.bensimple.co/", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://www.bensimple.co/legal", lastModified, changeFrequency: "monthly", priority: 0.4 }
  ];
}
