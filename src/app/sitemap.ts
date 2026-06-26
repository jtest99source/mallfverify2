import type { MetadataRoute } from "next";
import { getCategorySlugFromBusiness, isPublicCategorySlug, publicCategorySlugs, siteUrl } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { aboutPath, editorialPath, methodologyPath } from "@/lib/methodology";
import { getBusinessAreaCategoryPages, getSitemapEntities } from "@/lib/repository";
import { expertProfiles, expertVerticalSlugs } from "@/data/expertProfiles";

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
    urls.push({ url: `${siteUrl}/${locale}/experts`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    for (const expertSlug of expertVerticalSlugs) urls.push({ url: `${siteUrl}/${locale}/experts/${expertSlug}`, lastModified: now, changeFrequency: "weekly", priority: 0.75 });
    for (const profile of expertProfiles.filter((item) => item.status !== "hidden")) {
      urls.push({ url: `${siteUrl}/${locale}/experts/${profile.verticalSlug}/${profile.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.65 });
    }
    if (locale === "es" || locale === "en") urls.push({ url: `${siteUrl}/${locale}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    urls.push({ url: `${siteUrl}${methodologyPath(locale)}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
    urls.push({ url: `${siteUrl}${aboutPath(locale)}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    urls.push({ url: `${siteUrl}${editorialPath(locale)}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    for (const category of publicCategorySlugs) {
      urls.push({ url: `${siteUrl}/${locale}/${category}`, lastModified: now, changeFrequency: "daily", priority: 0.85 });
      urls.push({ url: `${siteUrl}/${locale}/top/${category}`, lastModified: now, changeFrequency: "daily", priority: 0.85 });
    }
    for (const page of areaPages.filter((page) => isPublicCategorySlug(page.category))) urls.push({ url: `${siteUrl}/${locale}/areas/${page.areaSlug}/${page.category}`, lastModified: now, changeFrequency: "weekly", priority: 0.75 });
    for (const business of businesses.filter((business) => isPublicCategorySlug(getCategorySlugFromBusiness(business.category)))) urls.push({ url: `${siteUrl}/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`, lastModified: new Date(business.updatedAt), changeFrequency: "weekly", priority: 0.7 });
    for (const ranking of rankings.filter((ranking) => ranking.locale === locale)) {
      urls.push({ url: `${siteUrl}/${locale}/rankings/${ranking.slug}`, lastModified: new Date(ranking.updatedAt), changeFrequency: "weekly", priority: 0.75 });
    }
  }
  const seenGuideSlugs = new Set<string>();
  for (const guide of guides) {
    if (seenGuideSlugs.has(guide.slug)) continue;
    seenGuideSlugs.add(guide.slug);
    for (const guideLocale of ["es", "en"] as const) {
      urls.push({ url: `${siteUrl}/${guideLocale}/guides/${guide.slug}`, lastModified: new Date(guide.updatedAt), changeFrequency: "weekly", priority: 0.7 });
    }
  }
  return urls;
}
