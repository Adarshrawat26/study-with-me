/** Normalize auth env vars — fixes quoted values pasted into Vercel. */
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

function normalizeEnv(name: string) {
  const raw = process.env[name];
  if (!raw) return;
  process.env[name] = stripQuotes(raw);
}

for (const key of [
  "AUTH_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
]) {
  normalizeEnv(key);
}

let authUrl = process.env.AUTH_URL;

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
