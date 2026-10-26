import { Auth, getAuth } from 'firebase/auth';

import { firebaseApp } from './firebaseApp';

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
