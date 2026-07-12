"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

function shouldShowLoading(anchor: HTMLAnchorElement, event: globalThis.MouseEvent) {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  const nextUrl = new URL(anchor.href, window.location.href);
  if (nextUrl.origin !== window.location.origin) return false;

  const current = `${window.location.pathname}${window.location.search}`;
  const next = `${nextUrl.pathname}${nextUrl.search}`;

  return current !== next;
}

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const routeCompleteTimeout = setTimeout(() => {
      setLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, 0);

    return () => clearTimeout(routeCompleteTimeout);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: globalThis.MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldShowLoading(anchor, event)) return;

      setLoading(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setLoading(false), 12000);
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      {children}
      {loading && (
        <div
          className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <LoadingScreen />
        </div>
      )}
    </>
  );
}
