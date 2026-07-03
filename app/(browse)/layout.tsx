import { BrowseAppShell } from "@/components/layout/BrowseAppShell";

export default function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BrowseAppShell>{children}</BrowseAppShell>;
}
