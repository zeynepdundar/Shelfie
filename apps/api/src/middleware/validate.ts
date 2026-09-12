import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";

import { badRequest } from "../http-error.js";

/** Gövde/parametre doğrulaması; hata durumunda 400 ve alan listesi döner. */
export function parseBody<T extends ZodTypeAny>(
  schema: T,
  req: Request,
): z.infer<T> {
  try {
    return schema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw badRequest("Geçersiz istek gövdesi", error.flatten().fieldErrors);
    }
    throw error;
  }
}

/** Gövdesi olan uçlarda JSON gelmediğinde anlaşılır hata verir. */
export function requireJson(req: Request, _res: Response, next: NextFunction) {
  if (!req.is("application/json")) {
    return next(badRequest("İstek gövdesi application/json olmalı"));
  }
  next();
}
