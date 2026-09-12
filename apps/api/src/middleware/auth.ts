import type { NextFunction, Request, Response } from "express";

import { env } from "../env.js";
import { verifyIdToken } from "../firebase.js";
import { unauthorized } from "../http-error.js";

/**
 * Authorization: Bearer <firebase id token> bekler.
 *
 * Yerel geliştirmede DEV_USER_ID tanımlıysa token aranmaz ve bütün istekler o
 * kullanıcıya ait sayılır — Firebase servis hesabı olmadan uçları denemek için.
 * NODE_ENV=production iken env.devUserId zaten boş gelir.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (env.devUserId) {
      req.user = {
        uid: env.devUserId,
        email: null,
        displayName: null,
        photoUrl: null,
      };
      return next();
    }

    const header = req.header("authorization") ?? "";
    const [scheme, token] = header.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw unauthorized("Authorization başlığı eksik veya hatalı");
    }

    req.user = await verifyIdToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

/** Handler'larda kullanıcının varlığını tekrar kontrol etmemek için. */
export function currentUser(req: Request) {
  if (!req.user) throw unauthorized();
  return req.user;
}
