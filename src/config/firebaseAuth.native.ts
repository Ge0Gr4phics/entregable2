import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

import { firebaseApp } from './firebaseApp';

export const auth: Auth | null = firebaseApp
  ? initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) })
  : null;
