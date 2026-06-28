/** Normalize auth URL — fixes quoted localhost AUTH_URL on Vercel. */
function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

let authUrl = process.env.AUTH_URL ? stripQuotes(process.env.AUTH_URL) : undefined;

if (process.env.VERCEL) {
  const isLocal = !authUrl || authUrl.includes("localhost") || authUrl.includes("127.0.0.1");
  if (isLocal) {
    const host =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL;
    if (host) authUrl = host.startsWith("http") ? host : `https://${host}`;
  }
}

if (authUrl) {
  process.env.AUTH_URL = authUrl;
}
