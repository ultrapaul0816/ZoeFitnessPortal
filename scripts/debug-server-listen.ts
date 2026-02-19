/**
 * Server Listen Diagnostic Script
 *
 * Run this when `npm run dev` fails with listen errors (ENOTSUP, EADDRINUSE, etc.)
 * Usage: npx tsx scripts/debug-server-listen.ts
 *
 * Tests server.listen() in progressive layers to isolate the failure:
 *   Step 1: Plain HTTP server (is Node/OS working?)
 *   Step 2: Express + HTTP server (is Express the issue?)
 *   Step 3: Express + Vite HMR (is Vite/HMR the issue?)
 *   Step 4: Full app minus session store (are routes/middleware the issue?)
 *   Step 5: Full app with session store (is the DB connection the issue?)
 *
 * Each step tests both 0.0.0.0 and localhost bindings.
 */

import http from "node:http";
import express from "express";
import { createServer as createViteServer } from "vite";
import viteConfig from "../vite.config";

const BASE_PORT = 5100; // Use high ports to avoid conflicts with running dev server
let portOffset = 0;
const nextPort = () => BASE_PORT + portOffset++;

interface TestResult {
  step: string;
  host: string;
  port: number;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function testListen(
  label: string,
  server: http.Server,
  host: string,
  cleanup?: () => Promise<void>
): Promise<boolean> {
  const port = nextPort();
  try {
    await new Promise<void>((resolve, reject) => {
      server.on("error", reject);
      server.listen(port, host, resolve);
    });
    results.push({ step: label, host, port, success: true });
    console.log(`  ✓ ${host}:${port}`);
    if (cleanup) await cleanup();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    return true;
  } catch (e: any) {
    results.push({ step: label, host, port, success: false, error: `${e.code}: ${e.message}` });
    console.log(`  ✗ ${host}:${port} — ${e.code}: ${e.message}`);
    if (cleanup) await cleanup();
    return false;
  }
}

console.log("=== Server Listen Diagnostics ===");
console.log(`Node.js ${process.version} | ${process.platform} ${process.arch}`);
console.log(`tsx: ${!!process.env.TSX}`);
console.log("");

// Step 1: Plain HTTP
console.log("Step 1: Plain http.createServer()");
await testListen("Plain HTTP", http.createServer(), "0.0.0.0");
await testListen("Plain HTTP", http.createServer(), "localhost");

// Step 2: Express
console.log("\nStep 2: Express + http.createServer()");
await testListen("Express", http.createServer(express()), "0.0.0.0");
await testListen("Express", http.createServer(express()), "localhost");

// Step 3: Express + Vite HMR
console.log("\nStep 3: Express + Vite HMR (with your vite.config)");
for (const host of ["0.0.0.0", "localhost"]) {
  const app = express();
  const server = http.createServer(app);
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true as const },
    appType: "custom",
  });
  app.use(vite.middlewares);
  await testListen("Vite HMR", server, host, () => vite.close());
}

// Step 4: Full app minus session store
console.log("\nStep 4: Full app (Express + middleware + routes + Vite), no session store");
for (const host of ["0.0.0.0", "localhost"]) {
  try {
    const compression = (await import("compression")).default;
    const { registerRoutes } = await import("../server/routes");
    const app = express();
    app.set("trust proxy", true);
    app.use(compression());
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: false, limit: "10mb" }));
    const server = await registerRoutes(app);
    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      server: { middlewareMode: true, hmr: { server }, allowedHosts: true as const },
      appType: "custom",
    });
    app.use(vite.middlewares);
    await testListen("Full (no DB)", server, host, () => vite.close());
  } catch (e: any) {
    console.log(`  ✗ ${host} — setup failed: ${e.message}`);
    results.push({ step: "Full (no DB)", host, port: -1, success: false, error: e.message });
  }
}

// Step 5: With session store (requires DATABASE_URL)
console.log("\nStep 5: Session store (requires DATABASE_URL)");
if (!process.env.DATABASE_URL) {
  console.log("  ⚠ DATABASE_URL not set — skipping. Set it and re-run to test this layer.");
  results.push({ step: "Session store", host: "n/a", port: -1, success: false, error: "DATABASE_URL not set" });
} else {
  try {
    const session = (await import("express-session")).default;
    const connectPgSimple = (await import("connect-pg-simple")).default;
    const PgSession = connectPgSimple(session);
    for (const host of ["0.0.0.0", "localhost"]) {
      const app = express();
      app.use(session({
        store: new PgSession({ conString: process.env.DATABASE_URL, tableName: "session", createTableIfMissing: true }),
        secret: "debug-test-secret",
        resave: false,
        saveUninitialized: false,
      }));
      const server = http.createServer(app);
      await testListen("Session store", server, host);
    }
  } catch (e: any) {
    console.log(`  ✗ Session store setup failed: ${e.message}`);
    results.push({ step: "Session store", host: "n/a", port: -1, success: false, error: e.message });
  }
}

// Summary
console.log("\n=== Summary ===");
const failures = results.filter((r) => !r.success);
if (failures.length === 0) {
  console.log("All tests passed. The issue may be environmental (port in use, firewall, etc.).");
  console.log("Try: lsof -i :<port> | to check if the port is occupied.");
} else {
  console.log("Failures:");
  for (const f of failures) {
    console.log(`  ${f.step} on ${f.host}:${f.port} — ${f.error}`);
  }
  console.log("\nDebugging tips:");
  console.log("- If 0.0.0.0 fails but localhost works → change host to 'localhost' in server/index.ts");
  console.log("- If session store step fails → check DATABASE_URL and PostgreSQL connectivity");
  console.log("- If Vite HMR step fails → try setting hmr: false in server/vite.ts");
  console.log("- If all steps pass → the issue may be with port conflicts or OS-level firewall");
}

process.exit(0);
