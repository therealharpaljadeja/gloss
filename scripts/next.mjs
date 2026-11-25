// Runs the Next.js CLI with its anonymous usage telemetry off, on every platform.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const bin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [bin, ...process.argv.slice(2)], { stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
