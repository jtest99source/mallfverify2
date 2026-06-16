import type { MetadataRoute } from "next";
import { categoryConfigs, getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { methodologyPath } from "@/lib/methodology";
import { getBusinessAreaCategoryPages, getSitemapEntities } from "@/lib/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { businesses, rankings, guides } = await getSitemapEntities();
  const areaPages = await getBusinessAreaCategoryPages(3);
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    urls.push({ url: `${siteUrl}/${locale}`, lastModified: now });
    urls.push({ url: `${siteUrl}/${locale}/business`, lastModified: now });
    urls.push({ url: `${siteUrl}/${locale}/privacy`, lastModified: now });
    urls.push({ url: `${siteUrl}/${locale}/cookies`, lastModified: now });
    urls.push({ url: `${siteUrl}/${locale}/rankings`, lastModified: now });
    if (locale === "es") urls.push({ url: `${siteUrl}/${locale}/guides`, lastModified: now });
    urls.push({ url: `${siteUrl}${methodologyPath(locale)}`, lastModified: now });
    for (const category of Object.keys(categoryConfigs)) {
      urls.push({ url: `${siteUrl}/${locale}/${category}`, lastModified: now });
      urls.push({ url: `${siteUrl}/${locale}/top/${category}`, lastModified: now });
    }
    for (const page of areaPages) urls.push({ url: `${siteUrl}/${locale}/areas/${page.areaSlug}/${page.category}`, lastModified: now });
    for (const business of businesses) urls.push({ url: `${siteUrl}/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`, lastModified: new Date(business.updatedAt) });
    for (const ranking of rankings) urls.push({ url: `${siteUrl}/${locale}/rankings/${ranking.slug}`, lastModified: new Date(ranking.updatedAt) });
    if (locale === "es") {
      for (const guide of guides) urls.push({ url: `${siteUrl}/${locale}/guides/${guide.slug}`, lastModified: new Date(guide.updatedAt) });
    }
  }
  return urls;
}
