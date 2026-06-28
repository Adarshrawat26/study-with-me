/** Map Vercel Postgres env vars before Prisma reads DATABASE_URL. */
const isLocalDb = (url?: string) =>
  !url || url.includes("localhost") || url.includes("127.0.0.1");

const onVercel = Boolean(process.env.VERCEL);

if (process.env.POSTGRES_PRISMA_URL) {
  if (onVercel || isLocalDb(process.env.DATABASE_URL)) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  }
}

if (process.env.POSTGRES_URL_NON_POOLING) {
  if (onVercel || isLocalDb(process.env.DIRECT_URL)) {
    process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
  }
}

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
