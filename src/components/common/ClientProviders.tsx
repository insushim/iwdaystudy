"use client";

import { useEffect } from "react";
import { UpdateNotification } from "./UpdateNotification";
import { IOSInstallBanner } from "./IOSInstallBanner";
import { initDemoAccounts } from "@/lib/local-auth";

export function ClientProviders() {
  useEffect(() => {
    // Initialize demo accounts on first visit
    initDemoAccounts();

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check for SW updates periodically
          setInterval(() => reg.update(), 60 * 60 * 1000); // hourly
        })
        .catch(() => {});
    }
  }, []);

  return (
    <>
      <UpdateNotification />
      <IOSInstallBanner />
    </>
  );
}
