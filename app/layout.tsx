import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Sans_SC, Noto_Sans_TC } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { colors } from "@/lib/colors";
import { createMetadata } from "@/lib/seo";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = createMetadata();

function themeScript() {
  const dark = colors.dark;
  const cssVars = Object.entries(dark)
    .map(([k, v]) => `--color-${k}:${v}`)
    .join(";");
  return `(function(){try{var t=localStorage.getItem("yeji-verse-theme");var m=t||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");var p=${JSON.stringify(dark)};var l=${JSON.stringify(colors.light)};var c=m==="dark"?p:l;for(var k in c)document.documentElement.style.setProperty("--color-"+k,c[k]);document.documentElement.classList.toggle("dark",m==="dark");document.documentElement.dataset.theme=m;document.documentElement.style.colorScheme=m}catch(e){}})()`;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${notoSansTC.variable} ${notoSansSC.variable} ${notoSansJP.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://player.bilibili.com" />
        <link rel="dns-prefetch" href="https://player.bilibili.com" />
        <link rel="preconnect" href="https://www.bilibili.com" />
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
        <SiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
