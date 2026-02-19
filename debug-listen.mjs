import http from "node:http";
import net from "node:net";

console.log("Node.js version:", process.version);
console.log("Platform:", process.platform, process.arch);
console.log("");

// Step 1: Can we create a basic net server on port 5000?
console.log("=== Step 1: net.createServer() on port 5000, localhost ===");
try {
  const s1 = net.createServer();
  await new Promise((resolve, reject) => {
    s1.on("error", reject);
    s1.listen(5000, "localhost", resolve);
  });
  console.log("SUCCESS: net server listening on localhost:5000");
  s1.close();
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 2: Can we create a basic net server on 0.0.0.0?
console.log("\n=== Step 2: net.createServer() on port 5001, 0.0.0.0 ===");
try {
  const s2 = net.createServer();
  await new Promise((resolve, reject) => {
    s2.on("error", reject);
    s2.listen(5001, "0.0.0.0", resolve);
  });
  console.log("SUCCESS: net server listening on 0.0.0.0:5001");
  s2.close();
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 3: Can we create an HTTP server on localhost?
console.log("\n=== Step 3: http.createServer() on port 5002, localhost ===");
try {
  const s3 = http.createServer((req, res) => res.end("ok"));
  await new Promise((resolve, reject) => {
    s3.on("error", reject);
    s3.listen(5002, "localhost", resolve);
  });
  console.log("SUCCESS: http server listening on localhost:5002");
  s3.close();
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 4: Can we create an HTTP server on 0.0.0.0?
console.log("\n=== Step 4: http.createServer() on port 5003, 0.0.0.0 ===");
try {
  const s4 = http.createServer((req, res) => res.end("ok"));
  await new Promise((resolve, reject) => {
    s4.on("error", reject);
    s4.listen(5003, "0.0.0.0", resolve);
  });
  console.log("SUCCESS: http server listening on 0.0.0.0:5003");
  s4.close();
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 5: No host specified (default)
console.log("\n=== Step 5: http.createServer() on port 5004, no host ===");
try {
  const s5 = http.createServer((req, res) => res.end("ok"));
  await new Promise((resolve, reject) => {
    s5.on("error", reject);
    s5.listen(5004, resolve);
  });
  console.log("SUCCESS: http server listening on port 5004 (default host)");
  s5.close();
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

// Step 6: Try port 3000 as alternative
console.log("\n=== Step 6: http.createServer() on port 3000, localhost ===");
try {
  const s6 = http.createServer((req, res) => res.end("ok"));
  await new Promise((resolve, reject) => {
    s6.on("error", reject);
    s6.listen(3000, "localhost", resolve);
  });
  console.log("SUCCESS: http server listening on localhost:3000");
  s6.close();
} catch (e) {
  console.log("FAILED:", e.code, e.message);
}

console.log("\n=== Done ===");
process.exit(0);
