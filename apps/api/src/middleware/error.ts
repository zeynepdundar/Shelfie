import type { NextFunction, Request, Response } from "express";

import { env } from "../env.js";
import { HttpError } from "../http-error.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "NotFound",
    message: `${req.method} ${req.originalUrl} bulunamadı`,
  });
}

/**
 * Tek hata çıkışı. Express 5 async handler'ların reddini buraya taşıdığı için
 * handler'larda try/catch gerekmez.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: error.name,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: "InternalServerError",
    message: "Beklenmeyen bir hata oluştu",
    ...(env.isProduction
      ? {}
      : { detail: error instanceof Error ? error.message : String(error) }),
  });
}
