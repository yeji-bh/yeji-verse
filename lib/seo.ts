import type { Metadata } from "next";

export const siteConfig = {
  name: "Yeji Verse",
  title: "Yeji Verse",
  description:
    "YEJI的影像庫",
  keywords: [
    "黃禮志",
    "Yeji",
    "ITZY",
    "禮志",
    "イェジ",
    "예지"
  ],
  locale: "zh_TW",
} as const;

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function createMetadata(overrides: Metadata = {}): Metadata {
  const url = getSiteUrl();
  const { title, openGraph, twitter, ...rest } = overrides;

  const pageTitle = typeof title === "string" ? title : null;
  const resolvedTitle = pageTitle
    ? { absolute: `${pageTitle} | ${siteConfig.name}` }
    : {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
      };
  const documentTitle = pageTitle ? `${pageTitle} | ${siteConfig.name}` : siteConfig.title;

  return {
    metadataBase: new URL(url),
    title: resolvedTitle,
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: documentTitle ?? siteConfig.title,
      description: siteConfig.description,
      ...openGraph,
      ...(documentTitle ? { title: openGraph?.title ?? documentTitle } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: documentTitle ?? siteConfig.title,
      description: siteConfig.description,
      ...twitter,
      ...(documentTitle ? { title: twitter?.title ?? documentTitle } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: url,
    },
    ...rest,
  };
}

export function siteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url,
    inLanguage: ["zh-TW", "zh-CN", "en", "ja", "ko"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
