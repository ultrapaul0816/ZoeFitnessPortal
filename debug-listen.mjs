import http from "node:http";
import { createServer as createViteServer } from "vite";

console.log("Node.js version:", process.version);
console.log("Platform:", process.platform, process.arch);
console.log("");

// Step 1: Plain HTTP server (baseline - we know this works)
console.log("=== Step 1: Plain http.createServer(), listen on port 5000 ===");
try {
  const s1 = http.createServer((req, res) => res.end("ok"));
  await new Promise((resolve, reject) => {
    s1.on("error", reject);
    s1.listen(5000, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await new Promise((resolve) => s1.close(resolve));
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 2: HTTP server + Vite with HMR attached to server
console.log("\n=== Step 2: http.createServer() + Vite HMR attached, listen on port 5001 ===");
try {
  const s2 = http.createServer((req, res) => res.end("ok"));
  const vite = await createViteServer({
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server: s2 },
    },
    appType: "custom",
  });
  console.log("Vite created, attempting listen...");
  await new Promise((resolve, reject) => {
    s2.on("error", reject);
    s2.listen(5001, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await vite.close();
  await new Promise((resolve) => s2.close(resolve));
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 3: HTTP server + Vite with HMR attached, listen on localhost
console.log("\n=== Step 3: http.createServer() + Vite HMR attached, listen on localhost:5002 ===");
try {
  const s3 = http.createServer((req, res) => res.end("ok"));
  const vite2 = await createViteServer({
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server: s3 },
    },
    appType: "custom",
  });
  console.log("Vite created, attempting listen...");
  await new Promise((resolve, reject) => {
    s3.on("error", reject);
    s3.listen(5002, "localhost", resolve);
  });
  console.log("SUCCESS");
  await vite2.close();
  await new Promise((resolve) => s3.close(resolve));
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 4: HTTP server + Vite WITHOUT HMR (hmr: false)
console.log("\n=== Step 4: http.createServer() + Vite (hmr: false), listen on port 5003 ===");
try {
  const s4 = http.createServer((req, res) => res.end("ok"));
  const vite3 = await createViteServer({
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: "custom",
  });
  console.log("Vite created (no HMR), attempting listen...");
  await new Promise((resolve, reject) => {
    s4.on("error", reject);
    s4.listen(5003, "0.0.0.0", resolve);
  });
  console.log("SUCCESS");
  await vite3.close();
  await new Promise((resolve) => s4.close(resolve));
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 5: Listen FIRST, then attach Vite HMR
console.log("\n=== Step 5: Listen first on port 5004, THEN attach Vite HMR ===");
try {
  const s5 = http.createServer((req, res) => res.end("ok"));
  await new Promise((resolve, reject) => {
    s5.on("error", reject);
    s5.listen(5004, "0.0.0.0", resolve);
  });
  console.log("Listening, now creating Vite with HMR...");
  const vite4 = await createViteServer({
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server: s5 },
    },
    appType: "custom",
  });
  console.log("SUCCESS");
  await vite4.close();
  await new Promise((resolve) => s5.close(resolve));
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

console.log("\n=== Done ===");
process.exit(0);
