"use client";

import { useEffect } from "react";
import { UpdateNotification } from "./UpdateNotification";
import { IOSInstallBanner } from "./IOSInstallBanner";

export function ClientProviders() {
  useEffect(() => {
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
