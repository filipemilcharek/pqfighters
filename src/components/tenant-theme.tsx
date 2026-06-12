"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface TenantInfo {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

let cachedTenantInfo: TenantInfo | null = null;

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(cachedTenantInfo);

  useEffect(() => {
    const slug = session?.user?.tenantSlug;
    if (!slug) return;
    if (cachedTenantInfo) {
      setTenantInfo(cachedTenantInfo);
      return;
    }

    fetch(`/api/tenant-info?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.primaryColor) {
          cachedTenantInfo = data;
          setTenantInfo(data);
        }
      })
      .catch(() => {});
  }, [session?.user?.tenantSlug]);

  useEffect(() => {
    if (!tenantInfo) return;
    const root = document.documentElement;
    root.style.setProperty("--color-accent", tenantInfo.primaryColor);
    root.style.setProperty("--color-accent-dark", tenantInfo.secondaryColor);
    // Generate a lighter variant for hover/highlight
    root.style.setProperty("--color-accent-light", tenantInfo.primaryColor + "cc");

    return () => {
      root.style.removeProperty("--color-accent");
      root.style.removeProperty("--color-accent-dark");
      root.style.removeProperty("--color-accent-light");
    };
  }, [tenantInfo]);

  return <>{children}</>;
}

export function useTenantInfo() {
  return cachedTenantInfo;
}
