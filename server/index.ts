import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

// Trust proxy for secure cookies behind reverse proxy
app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === "production";

// SESSION_SECRET validation
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("[CONFIG] SESSION_SECRET is not set.");
  if (isProduction) {
    console.error("[CONFIG] Refusing to start in PRODUCTION without SESSION_SECRET");
    process.exit(1);
  }
}

// CORS whitelist
const allowedOrigins = [
  "https://securelex.ru",
  "https://www.securelex.ru",
  process.env.REPLIT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }
      // Allow all replit.app subdomains (for production deployments)
      if (origin.endsWith('.replit.app') || origin.endsWith('.repl.co')) {
        return callback(null, true);
      }
      // Check whitelist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, allow all origins
      if (!isProduction) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP can be enabled later
  })
);

// Rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const PgSession = connectPgSimple(session);

console.log(`[CONFIG] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
// Always use secure cookies since Replit uses HTTPS
console.log(`[CONFIG] Cookie settings: sameSite=none, secure=true`);

const sessionStore = new PgSession({
  pool,
  tableName: "session",
  createTableIfMissing: false,
  errorLog: (err) => console.error('[SESSION STORE ERROR]', err),
});

sessionStore.on('error', (err) => {
  console.error('[SESSION STORE] Connection error:', err);
});

app.use(
  session({
    store: sessionStore,
    secret: sessionSecret || "securelex-dev-secret-key",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none" as const,
      secure: true,
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure superadmin exists on startup
  await storage.ensureSuperAdmin();
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
