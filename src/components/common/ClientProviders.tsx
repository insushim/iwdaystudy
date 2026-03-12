"use client";

import { useEffect } from "react";
import { UpdateNotification } from "./UpdateNotification";
import { IOSInstallBanner } from "./IOSInstallBanner";
import { initDemoAccounts } from "@/lib/local-auth";

export function ClientProviders() {
  useEffect(() => {
    // Initialize demo accounts on first visit
    initDemoAccounts();

    // Unregister any existing service worker and clear caches
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      }
    }
  }, []);

  return (
    <>
      <UpdateNotification />
      <IOSInstallBanner />
    </>
  );
}
