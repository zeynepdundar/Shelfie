import type { Request } from "express";

import { badRequest } from "../http-error.js";

/**
 * req.params'tan tek bir yol parametresini string olarak okur.
 *
 * Express'in tipleri iç içe router'larda (mergeParams) üst router'ın
 * parametrelerini bilemez ve tekrar eden parametrelerde string[] döndürebilir;
 * bu yardımcı ikisini de tek yerde çözer.
 */
export function param(req: Request, name: string): string {
  const value = (req.params as Record<string, string | string[] | undefined>)[
    name
  ];

  if (typeof value === "string" && value.length > 0) return value;

  throw badRequest(`${name} parametresi eksik`);
}
