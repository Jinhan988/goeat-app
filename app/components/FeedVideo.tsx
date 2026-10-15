"use client";
import { useEffect, useRef, useState } from "react";

// A muted, looping food clip for the feed. It only downloads and plays while
// it is on screen, and shows just the still image on data-saver connections.
export default function FeedVideo({ src, poster, alt, onFirstPlay }: { src: string; poster: string; alt: string; onFirstPlay?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const played = useRef(false);
  const [stillOnly, setStillOnly] = useState(false);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""))) { setStillOnly(true); return; }
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        v.play().then(() => {
          if (!played.current) { played.current = true; onFirstPlay?.(); }
        }).catch(() => {});
      } else {
        v.pause();
      }
    }, { threshold: 0.6 });
    io.observe(v);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stillOnly) return <img src={poster} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-label={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
  );
}
