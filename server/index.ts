import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startWhatsAppReminderScheduler } from "./schedulers/whatsapp-reminder";
import { startInactivityScheduler } from "./schedulers/email-inactivity";
import { startCampaignScheduler } from "./schedulers/email-campaign";

const app = express();
app.set('trust proxy', true);
app.use(compression()); // gzip compress all responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration with PostgreSQL store
// Use PROD_DATABASE_URL for production deployments, fallback to DATABASE_URL for development
const isProduction = process.env.NODE_ENV === "production";
const dbConnectionString = isProduction 
  ? (process.env.PROD_DATABASE_URL || process.env.DATABASE_URL)
  : process.env.DATABASE_URL;
const PgSession = connectPgSimple(session);

// Configure cookie based on environment
// Production/Replit (HTTPS): secure + sameSite=none for iframe/cross-origin compatibility
// Local development (HTTP): secure=false + sameSite=lax for localhost sessions
const isReplit = !!process.env.REPL_ID;
const cookieConfig = {
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days - extended for better user experience
  httpOnly: true,
  secure: isProduction || isReplit,
  sameSite: (isProduction || isReplit ? "none" : "lax") as "none" | "lax",
};

console.log(`[SESSION] Config - isProduction: ${isProduction}, secure: ${cookieConfig.secure}, sameSite: ${cookieConfig.sameSite}`);

app.use(
  session({
    store: new PgSession({
      conString: dbConnectionString,
      tableName: "session", // PostgreSQL table name for sessions
      createTableIfMissing: true, // Auto-create session table
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: cookieConfig,
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("[ERROR]", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "localhost", () => {
    log(`serving on port ${port}`);
    
    // Start scheduled tasks
    startWhatsAppReminderScheduler();
    startInactivityScheduler();
    startCampaignScheduler();
  });
})();
