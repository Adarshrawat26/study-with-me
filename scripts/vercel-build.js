require("./ensure-db-env");

const { execSync } = require("child_process");

const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

run("npx prisma generate");

try {
  run("npx prisma migrate deploy");
} catch {
  // Recover from a previously failed migration attempt (e.g. corrupt SQL).
  run("npx prisma migrate resolve --rolled-back 20250626000000_init");
  run("npx prisma migrate deploy");
}

run("npx next build");
