import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { MediaDetail, MediaType, MyListInput, MyListItem, WatchStatus } from '../types';

const LOCAL_CACHE_KEY = 'mi_lista_cache_v1';

export function buildItemId(type: MediaType, tmdbId: number): string {
  return `${type}_${tmdbId}`;
}

function normalizeFirestoreTimestamp(value: unknown): string | null {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}

function normalizeFirestoreItem(id: string, data: Record<string, unknown>): MyListItem {
  const estado = data.estado as WatchStatus | undefined;
  const type = data.type as MediaType | undefined;
  const title = typeof data.title === 'string' ? data.title : 'Sin título';

  return {
    id,
    tmdbId: typeof data.tmdbId === 'number' ? data.tmdbId : Number(data.tmdbId ?? 0),
    type: type ?? 'movie',
    title,
    year: typeof data.year === 'string' ? data.year : 'Sin año',
    posterPath: typeof data.posterPath === 'string' ? data.posterPath : null,
    estado: estado ?? 'por_ver',
    calificacion: typeof data.calificacion === 'number' ? data.calificacion : null,
    comentario: typeof data.comentario === 'string' ? data.comentario : '',
    agregadoEn: normalizeFirestoreTimestamp(data.agregadoEn),
  };
}

export async function saveLocalList(items: MyListItem[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(items));
}

export async function loadLocalList(): Promise<MyListItem[]> {
  const raw = await AsyncStorage.getItem(LOCAL_CACHE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as MyListItem[]) : [];
  } catch {
    return [];
  }
}

export async function addToMyList(userId: string, media: MyListInput): Promise<boolean> {
  if (!db) {
    throw new Error('Firebase no está configurado.');
  }

  const itemId = buildItemId(media.type, media.tmdbId);
  const reference = doc(db, 'users', userId, 'mi_lista', itemId);
  const snapshot = await getDoc(reference);

  if (snapshot.exists()) {
    return false;
  }

  await setDoc(reference, {
    tmdbId: media.tmdbId,
    type: media.type,
    title: media.title,
    year: media.year,
    posterPath: media.posterPath,
    estado: 'por_ver',
    calificacion: null,
    comentario: '',
    agregadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return true;
}

export async function listUserItems(userId: string): Promise<MyListItem[]> {
  if (!db) {
    return [];
  }

  const itemsRef = collection(db, 'users', userId, 'mi_lista');
  const orderedQuery = query(itemsRef, orderBy('agregadoEn', 'desc'));
  const snapshot = await getDocs(orderedQuery);

  return snapshot.docs.map((document) => normalizeFirestoreItem(document.id, document.data() as Record<string, unknown>));
}

export async function updateListItem(
  userId: string,
  itemId: string,
  updates: Partial<Omit<MyListItem, 'id' | 'tmdbId' | 'type' | 'title' | 'year' | 'posterPath' | 'agregadoEn'>>,
): Promise<void> {
  if (!db) {
    return;
  }

  const reference = doc(db, 'users', userId, 'mi_lista', itemId);
  await updateDoc(reference, {
    ...updates,
    actualizadoEn: serverTimestamp(),
  });
}

export async function removeListItem(userId: string, itemId: string): Promise<void> {
  if (!db) {
    return;
  }

  const reference = doc(db, 'users', userId, 'mi_lista', itemId);
  await deleteDoc(reference);
}

export function mapMediaDetailToInput(media: MediaDetail): MyListInput {
  return {
    tmdbId: media.id,
    type: media.mediaType,
    title: media.title,
    year: media.year,
    posterPath: media.posterPath,
  };
}
