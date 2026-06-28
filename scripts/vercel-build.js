require("./ensure-db-env");

const { execSync } = require("child_process");

const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

run("npx prisma generate");
run("npx prisma migrate deploy");
run("npx next build");
