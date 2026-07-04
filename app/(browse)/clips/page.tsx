import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "片段收藏",
  description: "你收藏的影片時間戳書籤，一鍵跳到名場面。",
  alternates: { canonical: "/clips" },
});

export default function ClipsPage() {
  return null;
}
