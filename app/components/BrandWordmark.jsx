"use client";

import { useEffect, useRef, useState } from "react";

export default function BrandWordmark({ className = "", priority = false }) {
  const imageRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (imageRef.current?.complete) setLoaded(imageRef.current.naturalWidth > 0);
  }, []);

  return (
    <img
      ref={imageRef}
      className={`brandWordmark ${className}`.trim()}
      src="/BENSIMPLE_WORDMARK_APPROVED.png"
      alt="BenSimple"
      width="520"
      height="156"
      fetchPriority={priority ? "high" : "auto"}
      style={{ visibility: loaded ? "visible" : "hidden" }}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
    />
  );
}
