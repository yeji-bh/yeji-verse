import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { colors } from "@/lib/colors";
import { createMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = createMetadata();

function themeScript() {
  const dark = colors.dark;
  return `(function(){try{var t=localStorage.getItem("yeji-verse-theme");var m=t||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");var p=${JSON.stringify(dark)};var l=${JSON.stringify(colors.light)};var c=m==="dark"?p:l;for(var k in c)document.documentElement.style.setProperty("--color-"+k,c[k]);document.documentElement.classList.toggle("dark",m==="dark");document.documentElement.dataset.theme=m;document.documentElement.style.colorScheme=m}catch(e){}})()`;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
        <SiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
