import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './env';

export const firebaseApp: FirebaseApp | null =
  getApps().length > 0
    ? getApps()[0]
    : firebaseConfig.apiKey
      ? initializeApp(firebaseConfig)
      : null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;