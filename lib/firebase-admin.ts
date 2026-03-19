import * as admin from 'firebase-admin';

// Load service account from environment variables if it exists
// e.g., process.env.FIREBASE_SERVICE_ACCOUNT
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccountKey 
        ? admin.credential.cert(serviceAccountKey)
        : admin.credential.applicationDefault(), // Fallback
    });
    console.log("Firebase Admin initialized.");
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
  }
}

export const db = admin.firestore();
