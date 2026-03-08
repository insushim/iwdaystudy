// Cloudflare Pages Function: GET /api/version
// Returns current app version information for update checking

export const onRequestGet: PagesFunction = async () => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const buildDate = kst.toISOString().split("T")[0];

  return new Response(
    JSON.stringify({
      version: "1.0.0",
      minVersion: "1.0.0",
      buildDate,
      features: {
        aiGeneration: true,
        offlineMode: true,
        badges: true,
        reports: true,
      },
      maintenance: false,
      message: null,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
