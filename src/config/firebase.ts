import { Firestore, getFirestore } from 'firebase/firestore';

import { auth } from './firebaseAuth';
import { firebaseApp } from './firebaseApp';

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

export { auth, firebaseApp };