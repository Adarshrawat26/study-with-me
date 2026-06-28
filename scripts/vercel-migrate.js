#!/usr/bin/env node
/**
 * After connecting Vercel Postgres to the project, run migrations against it.
 * Usage: npm run db:vercel-migrate
 */
require("dotenv/config");
require("./ensure-db-env");

const { execSync } = require("child_process");

if (!process.env.DATABASE_URL?.includes("vercel-storage") &&
    !process.env.DATABASE_URL?.includes("neon.tech") &&
    !process.env.POSTGRES_PRISMA_URL) {
  console.error(
    "No Vercel Postgres URL found. Connect Storage → Postgres to study-with-me first,\n" +
      "then run: vercel env pull .env.vercel"
  );
  process.exit(1);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
console.log("Production database migrated.");
