import SiteShell from "@/components/site-shell";
import LocalBusinessJsonLd from "@/components/local-business-jsonld";
import type { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell transparentBar>
      <LocalBusinessJsonLd />
      {children}
    </SiteShell>
  );
}
