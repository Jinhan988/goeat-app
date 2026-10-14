import { NextResponse } from "next/server";
import { FEED } from "../../lib/feed";

// Photos for the Home feed. The response is cached for a day, so Unsplash is
// called once per dish per day instead of once per visitor.
export const revalidate = 86400;

type Photo = { name: string; url: string; credit: { name: string; link: string } | null };

export async function GET() {
  const key = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_KEY;
  if (!key) return NextResponse.json({ photos: [] });

  const photos: Photo[] = await Promise.all(
    FEED.map(async ({ name, query }): Promise<Photo> => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " food")}&per_page=1&orientation=portrait&content_filter=high`,
          { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 86400 } }
        );
        if (!res.ok) return { name, url: "", credit: null };
        const data = await res.json();
        const p = data.results?.[0];
        if (!p) return { name, url: "", credit: null };
        return {
          name,
          url: p.urls?.small || "",
          credit: p.user?.name ? { name: p.user.name, link: p.user.links?.html || "https://unsplash.com" } : null,
        };
      } catch {
        return { name, url: "", credit: null };
      }
    })
  );

  return NextResponse.json({ photos });
}
