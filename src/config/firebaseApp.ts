import { FirebaseApp, getApps, initializeApp } from 'firebase/app';

import { firebaseConfig, firebaseConfigured } from './env';

export const firebaseApp: FirebaseApp | null = firebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;
