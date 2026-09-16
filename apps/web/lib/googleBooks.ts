import type { GoogleBook } from "@shelfie/types";

const ENDPOINT = "https://www.googleapis.com/books/v1/volumes";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY?.trim() ?? "";

/**
 * Google Books artık anahtarsız isteklere kota vermiyor
 * (anonim proje için "Queries per day" limiti 0, istek 429 dönüyor).
 * Bu yüzden anahtar zorunlu; yoksa istek hiç yapılmaz.
 */
export const hasGoogleBooksKey = API_KEY.length > 0;

export class MissingApiKeyError extends Error {
  constructor() {
    super("NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY tanımlı değil");
    this.name = "MissingApiKeyError";
  }
}

function buildUrl(query: string, maxResults: number) {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    key: API_KEY,
  });

  return `${ENDPOINT}?${params.toString()}`;
}

export class GoogleBooksError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "GoogleBooksError";
  }

  /** Geçici yoğunluk: biraz bekleyip tekrar denemek anlamlı. */
  get isTransient() {
    return this.status === 429 || this.status === 503;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * İstekler sıraya alınır ve aralarında en az MIN_GAP_MS boşluk bırakılır.
 * Kapağı olmayan on kitap aynı anda istek atınca Google 503 dönüyordu.
 */
const MIN_GAP_MS = 250;
let chain: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function schedule<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = MIN_GAP_MS - (Date.now() - lastCallAt);
    if (wait > 0) await sleep(wait);
    lastCallAt = Date.now();
    return task();
  });

  // Bir istek hata verdiğinde sıradakiler de düşmesin.
  chain = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return (body?.error?.message as string) ?? "";
  } catch {
    return "";
  }
}

async function request(query: string, maxResults: number) {
  if (!hasGoogleBooksKey) throw new MissingApiKeyError();

  return schedule(async () => {
    let lastError: GoogleBooksError | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (attempt > 0) await sleep(1200);

      const response = await fetch(buildUrl(query, maxResults));
      if (response.ok) {
        return (await response.json()) as { items?: GoogleBook[] };
      }

      const failure = new GoogleBooksError(
        (await readErrorMessage(response)) || `Google Books ${response.status}`,
        response.status
      );

      if (!failure.isTransient) throw failure;
      lastError = failure;
    }

    throw lastError as GoogleBooksError;
  });
}

/** Kapak adresleri bazen http geliyor; https sayfasında engellenmesin. */
function toHttps(url?: string) {
  return url ? url.replace(/^http:\/\//, "https://") : undefined;
}

export async function searchGoogleBooks(
  query: string,
  maxResults = 4
): Promise<GoogleBook[]> {
  const data = await request(query, maxResults);

  return (data.items ?? []).map((item) => ({
    ...item,
    volumeInfo: {
      ...item.volumeInfo,
      imageLinks: item.volumeInfo.imageLinks
        ? { thumbnail: toHttps(item.volumeInfo.imageLinks.thumbnail) }
        : undefined,
    },
  }));
}

export async function findBookCover(
  title: string,
  author: string
): Promise<string | undefined> {
  const data = await request(`${title} ${author}`.trim(), 1);
  return toHttps(data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail);
}
