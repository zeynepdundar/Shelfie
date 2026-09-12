/** Handler'ların fırlattığı, istemciye dönecek hatalar. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details);
export const unauthorized = (message = "Kimlik doğrulanamadı") =>
  new HttpError(401, message);
export const notFound = (message = "Kayıt bulunamadı") =>
  new HttpError(404, message);
export const serviceUnavailable = (message: string) =>
  new HttpError(503, message);
