import type { Metadata } from "next";

// The Experts section is still under construction and must not surface in search
// results yet. noindex,nofollow applies to the whole /experts subtree (index,
// verticals and profiles). Pages stay crawlable (no robots.txt Disallow) so
// Google can actually see the noindex and drop already-indexed URLs; the section
// is also excluded from the sitemap. Remove this file to make Experts public.
export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
