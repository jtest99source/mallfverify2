import type { MetadataRoute } from "next";
import { getCategorySlugFromBusiness, isPublicCategorySlug, publicCategorySlugs, siteUrl } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { aboutPath, editorialPath, methodologyPath } from "@/lib/methodology";
import { getBusinessAreaCategoryPages, getSitemapEntities } from "@/lib/repository";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { businesses, rankings, guides } = await getSitemapEntities();
  const areaPages = await getBusinessAreaCategoryPages(3);
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    urls.push({ url: `${siteUrl}/${locale}`, lastModified: now, changeFrequency: "daily", priority: 1 });
    urls.push({ url: `${siteUrl}/${locale}/business`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    urls.push({ url: `${siteUrl}/${locale}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 });
    urls.push({ url: `${siteUrl}/${locale}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 });
    // Experts is still under construction — intentionally excluded from the sitemap
    // and noindexed (see src/app/[locale]/experts/layout.tsx) until it's ready.
    urls.push({ url: `${siteUrl}/${locale}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    urls.push({ url: `${siteUrl}/${locale}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    urls.push({ url: `${siteUrl}/${locale}/insights`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    urls.push({ url: `${siteUrl}/${locale}/insights/dental-mallorca-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    urls.push({ url: `${siteUrl}${methodologyPath(locale)}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
    urls.push({ url: `${siteUrl}${aboutPath(locale)}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    urls.push({ url: `${siteUrl}${editorialPath(locale)}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    for (const category of publicCategorySlugs) {
      // Old /{locale}/{category} index now 308-redirects to /top; only the live ranking URL is advertised.
      urls.push({ url: `${siteUrl}/${locale}/top/${category}`, lastModified: now, changeFrequency: "daily", priority: 0.85 });
    }
    for (const page of areaPages.filter((page) => isPublicCategorySlug(page.category))) urls.push({ url: `${siteUrl}/${locale}/areas/${page.areaSlug}/${page.category}`, lastModified: now, changeFrequency: "weekly", priority: 0.75 });
    for (const business of businesses.filter((business) => isPublicCategorySlug(getCategorySlugFromBusiness(business.category)))) urls.push({ url: `${siteUrl}/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`, lastModified: new Date(business.updatedAt), changeFrequency: "weekly", priority: 0.7 });
    for (const ranking of rankings.filter((ranking) => ranking.locale === locale)) {
      urls.push({ url: `${siteUrl}/${locale}/rankings/${ranking.slug}`, lastModified: new Date(ranking.updatedAt), changeFrequency: "weekly", priority: 0.75 });
    }
  }
  // One URL per guide version that actually exists in the DB (slug × locale) —
  // never advertise locale versions that would 404 or duplicate.
  for (const guide of guides) {
    urls.push({ url: `${siteUrl}/${guide.locale}/guides/${guide.slug}`, lastModified: new Date(guide.updatedAt), changeFrequency: "weekly", priority: 0.7 });
  }
  return urls;
}
