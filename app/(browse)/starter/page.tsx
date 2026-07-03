import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "入坑必看",
  alternates: { canonical: "/starter" },
});

export default function StarterPage() {
  return null;
}
