import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '../config/firebase';
import {
  addToMyList,
  listUserItems,
  loadLocalList,
  mapMediaDetailToInput,
  removeListItem,
  saveLocalList,
  updateListItem,
} from '../services/myListService';
import { MyListInput, MyListItem } from '../types';

interface AppContextValue {
  user: User | null;
  authReady: boolean;
  items: MyListItem[];
  myList: MyListItem[]; // <--- Agregado para soportar myList en DetailScreen
  isOffline: boolean;
  loadingItems: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  addToList: (item: MyListInput) => Promise<boolean>;
  updateEntry: (
    itemId: string,
    changes: Partial<Omit<MyListItem, 'id' | 'tmdbId' | 'type' | 'title' | 'year' | 'posterPath' | 'agregadoEn'>>
  ) => Promise<void>;
  removeFromList: (itemId: string) => Promise<void>;
  refreshList: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<MyListItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!Boolean(state.isConnected));
    });

    void NetInfo.fetch().then((state) => {
      setIsOffline(!Boolean(state.isConnected));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    void refreshList();
  }, [user]);

  async function refreshList(): Promise<void> {
    if (!user) {
      setItems([]);
      return;
    }

    setLoadingItems(true);

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        const cached = await loadLocalList();
        setItems(cached);
        return;
      }

      const remoteItems = await listUserItems(user.uid);
      setItems(remoteItems);
      await saveLocalList(remoteItems);
    } catch {
      const cached = await loadLocalList();
      setItems(cached);
    } finally {
      setLoadingItems(false);
    }
  }

  async function signIn(email: string, password: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase no está configurado. Añade la configuración en .env.');
    }

    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase no está configurado. Añade la configuración en .env.');
    }

    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function signOutUser(): Promise<void> {
    if (!auth) {
      return;
    }

    await signOut(auth);
    await AsyncStorage.removeItem('mi_lista_cache_v1');
    setItems([]);
  }

  async function addToList(item: MyListInput): Promise<boolean> {
    if (!user) {
      return false;
    }

    const added = await addToMyList(user.uid, item);
    if (added) {
      await refreshList();
    }
    return added;
  }

  async function updateEntry(
    itemId: string,
    changes: Partial<Omit<MyListItem, 'id' | 'tmdbId' | 'type' | 'title' | 'year' | 'posterPath' | 'agregadoEn'>>
  ): Promise<void> {
    if (!user) {
      return;
    }

    await updateListItem(user.uid, itemId, changes);
    await refreshList();
  }

  async function removeFromList(itemId: string): Promise<void> {
    if (!user) {
      return;
    }

    await removeListItem(user.uid, itemId);
    await refreshList();
  }

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      authReady,
      items,
      myList: items, // <--- Se asigna `items` a `myList`
      isOffline,
      loadingItems,
      signIn,
      signUp,
      signOutUser,
      addToList,
      updateEntry,
      removeFromList,
      refreshList,
    }),
    [user, authReady, items, isOffline, loadingItems]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}

export { mapMediaDetailToInput };