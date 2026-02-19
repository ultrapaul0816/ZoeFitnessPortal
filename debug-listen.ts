import http from "node:http";
import express from "express";
import { createServer as createViteServer } from "vite";
import viteConfig from "./vite.config";

console.log("Node.js version:", process.version);
console.log("Running via tsx (same as npm run dev)");
console.log("");

// Step 1: Plain http server
console.log("=== Step 1: Plain http.createServer(), listen 5000 ===");
try {
  const s1 = http.createServer();
  await new Promise<void>((resolve, reject) => {
    s1.on("error", reject);
    s1.listen(5000, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await new Promise<void>((resolve) => s1.close(() => resolve()));
} catch (e: any) {
  console.log("FAILED:", e.code, e.message);
}

// Step 2: Express app wrapped in http.createServer()
console.log("\n=== Step 2: Express + http.createServer(), listen 5001 ===");
try {
  const app2 = express();
  const s2 = http.createServer(app2);
  await new Promise<void>((resolve, reject) => {
    s2.on("error", reject);
    s2.listen(5001, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await new Promise<void>((resolve) => s2.close(() => resolve()));
} catch (e: any) {
  console.log("FAILED:", e.code, e.message);
}

// Step 3: Express + Vite with YOUR vite.config.ts + HMR
console.log("\n=== Step 3: Express + Vite (your config) + HMR, listen 5002 ===");
try {
  const app3 = express();
  const s3 = http.createServer(app3);
  const vite3 = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server: s3 },
      allowedHosts: true as const,
    },
    appType: "custom",
  });
  app3.use(vite3.middlewares);
  console.log("Vite created with your config, attempting listen...");
  await new Promise<void>((resolve, reject) => {
    s3.on("error", reject);
    s3.listen(5002, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await vite3.close();
  await new Promise<void>((resolve) => s3.close(() => resolve()));
} catch (e: any) {
  console.log("FAILED:", e.code, e.message);
}

// Step 4: Full app setup (Express + middleware + routes + Vite)
console.log("\n=== Step 4: Full app (Express + JSON + compression + routes + Vite), listen 5003 ===");
try {
  const compression = (await import("compression")).default;
  const { registerRoutes } = await import("./server/routes");

  const app4 = express();
  app4.set('trust proxy', true);
  app4.use(compression());
  app4.use(express.json({ limit: '10mb' }));
  app4.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Skip session store (needs DB) - go straight to routes
  console.log("Registering routes...");
  const s4 = await registerRoutes(app4);

  console.log("Setting up Vite...");
  const vite4 = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server: s4 },
      allowedHosts: true as const,
    },
    appType: "custom",
  });
  app4.use(vite4.middlewares);

  console.log("Attempting listen...");
  await new Promise<void>((resolve, reject) => {
    s4.on("error", reject);
    s4.listen(5003, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await vite4.close();
  await new Promise<void>((resolve) => s4.close(() => resolve()));
} catch (e: any) {
  console.log("FAILED:", e.code, e.message);
}

console.log("\n=== Done ===");
process.exit(0);
