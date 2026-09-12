import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { env, hasFirebaseCredentials } from "./env.js";
import { serviceUnavailable } from "./http-error.js";

let app: App | undefined;

function getFirebaseApp(): App {
  if (!hasFirebaseCredentials) {
    throw serviceUnavailable(
      "Firebase kimlik bilgileri eksik. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY tanımlayın.",
    );
  }

  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
      });
  }

  return app;
}

/** Firebase ID token'ını doğrular ve uid ile temel bilgileri döndürür. */
export async function verifyIdToken(token: string) {
  const decoded = await getAuth(getFirebaseApp()).verifyIdToken(token);

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    displayName: decoded.name ?? null,
    photoUrl: decoded.picture ?? null,
  };
}
