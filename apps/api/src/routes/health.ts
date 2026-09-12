import { Router } from "express";

import { hasDatabase, hasFirebaseCredentials, env } from "../env.js";

export const healthRouter = Router();

/** Kimlik doğrulaması istemez; hangi bağımlılığın hazır olduğunu da söyler. */
healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    dependencies: {
      database: hasDatabase ? "configured" : "missing",
      firebase: hasFirebaseCredentials
        ? "configured"
        : env.devUserId
          ? "bypassed (DEV_USER_ID)"
          : "missing",
    },
  });
});
