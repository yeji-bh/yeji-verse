import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "我的收藏",
  description: "你收藏的黃禮志影片列表。",
  alternates: { canonical: "/favorites" },
});

export default function FavoritesPage() {
  return null;
}
