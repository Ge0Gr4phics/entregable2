import NetInfo from '@react-native-community/netinfo';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { auth } from '../config/firebase';
import {
  addToMyList,
  clearLocalList,
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
  listError: string | null;
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
  const [authReady, setAuthReady] = useState(auth === null);
  const [listError, setListError] = useState<string | null>(null);
  const listRequestId = useRef(0);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      listRequestId.current += 1;
      setUser(firebaseUser);
      setItems([]);
      setLoadingItems(false);
      setListError(null);
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

  const refreshList = useCallback(async (): Promise<void> => {
    const requestId = ++listRequestId.current;
    if (!user) {
      setItems([]);
      setListError(null);
      return;
    }

    setLoadingItems(true);
    setListError(null);

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        const cached = await loadLocalList(user.uid);
        if (requestId === listRequestId.current) {
          setItems(cached);
        }
        return;
      }

      const remoteItems = await listUserItems(user.uid);
      if (requestId !== listRequestId.current) {
        return;
      }
      setItems(remoteItems);
      await saveLocalList(user.uid, remoteItems);
    } catch (error) {
      if (requestId === listRequestId.current) {
        try {
          const cached = await loadLocalList(user.uid);
          setItems(cached);
        } catch (cacheError) {
          setItems([]);
          setListError(
            `No se pudo sincronizar Mi lista ni leer la copia local. ${
              cacheError instanceof Error ? cacheError.message : 'Error al leer la copia local.'
            }`,
          );
          return;
        }
        setListError(
          error instanceof Error
            ? `No se pudo sincronizar Mi lista. ${error.message}`
            : 'No se pudo sincronizar Mi lista. Revisa tu conexión e inténtalo de nuevo.',
        );
      }
    } finally {
      if (requestId === listRequestId.current) {
        setLoadingItems(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const timeout = setTimeout(() => {
      void refreshList();
    }, 0);

    return () => clearTimeout(timeout);
  }, [user, refreshList]);

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
      throw new Error('Firebase no está configurado. Añade la configuración en .env.');
    }

    const userId = user?.uid;
    await signOut(auth);
    if (userId) {
      await clearLocalList(userId);
    }
    setItems([]);
  }

  async function addToList(item: MyListInput): Promise<boolean> {
    if (!user) {
      throw new Error('Inicia sesión para agregar elementos a Mi lista.');
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
      throw new Error('Inicia sesión para editar elementos de Mi lista.');
    }

    await updateListItem(user.uid, itemId, changes);
    await refreshList();
  }

  async function removeFromList(itemId: string): Promise<void> {
    if (!user) {
      throw new Error('Inicia sesión para quitar elementos de Mi lista.');
    }

    await removeListItem(user.uid, itemId);
    await refreshList();
  }

  const value: AppContextValue = {
    user,
    authReady,
    items,
    myList: items,
    isOffline,
    loadingItems,
    listError,
    signIn,
    signUp,
    signOutUser,
    addToList,
    updateEntry,
    removeFromList,
    refreshList,
  };

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