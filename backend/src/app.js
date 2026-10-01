import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import ApiError from "./utils/ApiError.js";
import asyncHandler from "./utils/asyncHandler.js";
import connectDB from "./db/index.js";

const app = express();

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

if (process.env.VERCEL === "1") {
  app.set("trust proxy", 1);
}

app.use(helmet());

// CORS
const allowedOrigins = new Set(config.corsOrigins);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");
}

app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
  })
);

// Additional origin protection
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  if (origin && !allowedOrigins.has(origin)) {
    return next(new ApiError(403, "Origin not allowed"));
  }

  next();
});

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// Static files locally only
if (process.env.VERCEL !== "1") {
  app.use(express.static(path.join(currentDirectory, "../public")));
}

app.use(cookieParser());

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/healthz", async (req, res) => {
  try {
    const connection = await connectDB();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Backend and MongoDB are healthy",
      database: connection.readyState === 1 ? "connected" : "not connected",
    });
  } catch (error) {
    console.error("Health check MongoDB error:", error);

    res.status(503).json({
      statusCode: 503,
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// ROUTE IMPORTS
// --------------------------------------------------

import userRoutes from "./routes/user.route.js";
import userManagementRoutes from "./routes/userManagement.route.js";
import urlRoutes from "./routes/url.route.js";

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

const authenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

app.use("/v1/api/auth/login", authenticationLimiter);
app.use("/v1/api/auth/register", authenticationLimiter);

// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

// Connect to MongoDB on API requests.
// The connection should be cached/reused by connectDB().
app.use(
  "/v1/api",
  asyncHandler(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      console.error("MongoDB request connection failed:", error);

      next(new ApiError(503, "Database temporarily unavailable"));
    }
  })
);

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use("/v1/api/auth", userRoutes);

app.use("/v1/api/user", userManagementRoutes);

app.use("/v1/api/url", urlRoutes);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode =
    error.statusCode || error.status || 500;

  let message =
    error.message || "Internal server error";

  // MongoDB duplicate key
  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists";
  }

  // Mongoose validation/cast errors
  else if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    statusCode = 400;
  }

  // Multer errors
  else if (error.name === "MulterError") {
    statusCode =
      error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Profile photo must be 4 MB or smaller"
        : "Invalid profile photo upload";
  }

  // Server errors
  if (statusCode >= 500) {
    console.error(error);

    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
  });
});

export default app;