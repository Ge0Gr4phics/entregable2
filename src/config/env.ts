export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const firebaseConfigured = Object.values(firebaseConfig).every((value) => value.length > 0);

export const tmdbAccessToken = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN ?? '';
export const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';
