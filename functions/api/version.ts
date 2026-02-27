// Cloudflare Pages Function: GET /api/version
// Returns current app version information for update checking

export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      version: '0.1.0',
      minVersion: '0.1.0',
      buildDate: '2026-02-27',
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
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
