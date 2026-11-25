import AsyncStorage from "@react-native-async-storage/async-storage";
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
} from "firebase/firestore";

import { db } from "../config/firebase";
import { vistaEnTransition } from "../dominio/resumenAnual";
import {
  MediaDetail,
  MediaType,
  MyListInput,
  MyListItem,
  WatchStatus,
} from "../types";

const LOCAL_CACHE_KEY = "mi_lista_cache_v1";

function localListCacheKey(userId: string): string {
  return `${LOCAL_CACHE_KEY}_${userId}`;
}

export function buildItemId(type: MediaType, tmdbId: number): string {
  return `${type}_${tmdbId}`;
}

function normalizeFirestoreTimestamp(value: unknown): string | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function normalizeFirestoreItem(
  id: string,
  data: Record<string, unknown>,
): MyListItem {
  const estado = data.estado as WatchStatus | undefined;
  const type = data.type as MediaType | undefined;
  const title = typeof data.title === "string" ? data.title : "Sin título";

  return {
    id,
    tmdbId:
      typeof data.tmdbId === "number" ? data.tmdbId : Number(data.tmdbId ?? 0),
    type: type ?? "movie",
    title,
    year: typeof data.year === "string" ? data.year : "Sin año",
    posterPath: typeof data.posterPath === "string" ? data.posterPath : null,
    estado: estado ?? "por_ver",
    calificacion:
      typeof data.calificacion === "number" ? data.calificacion : null,
    comentario: typeof data.comentario === "string" ? data.comentario : "",
    agregadoEn: normalizeFirestoreTimestamp(data.agregadoEn),
    actualizadoEn: normalizeFirestoreTimestamp(data.actualizadoEn),
    vistaEn: normalizeFirestoreTimestamp(data.vistaEn),
    generos: Array.isArray(data.generos)
      ? data.generos
          .filter((value): value is string => typeof value === "string")
          .slice(0, 10)
      : [],
    duracionMin: typeof data.duracionMin === "number" ? data.duracionMin : null,
    directores: Array.isArray(data.directores)
      ? data.directores
          .filter((value): value is string => typeof value === "string")
          .slice(0, 10)
      : [],
  };
}

export async function saveLocalList(
  userId: string,
  items: MyListItem[],
): Promise<void> {
  await AsyncStorage.setItem(localListCacheKey(userId), JSON.stringify(items));
}

export async function loadLocalList(userId: string): Promise<MyListItem[]> {
  const raw = await AsyncStorage.getItem(localListCacheKey(userId));

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return (parsed as Partial<MyListItem>[]).map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      tmdbId: typeof item.tmdbId === "number" ? item.tmdbId : 0,
      type: item.type ?? "movie",
      title: typeof item.title === "string" ? item.title : "Sin título",
      year: typeof item.year === "string" ? item.year : "Sin año",
      posterPath: typeof item.posterPath === "string" ? item.posterPath : null,
      estado: item.estado ?? "por_ver",
      calificacion:
        typeof item.calificacion === "number" ? item.calificacion : null,
      comentario: typeof item.comentario === "string" ? item.comentario : "",
      agregadoEn: typeof item.agregadoEn === "string" ? item.agregadoEn : null,
      actualizadoEn:
        typeof item.actualizadoEn === "string" ? item.actualizadoEn : null,
      vistaEn: typeof item.vistaEn === "string" ? item.vistaEn : null,
      generos: Array.isArray(item.generos)
        ? item.generos.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
      duracionMin:
        typeof item.duracionMin === "number" ? item.duracionMin : null,
      directores: Array.isArray(item.directores)
        ? item.directores.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    }));
  } catch {
    return [];
  }
}

export async function clearLocalList(userId: string): Promise<void> {
  await AsyncStorage.multiRemove([localListCacheKey(userId), LOCAL_CACHE_KEY]);
}

export async function addToMyList(
  userId: string,
  media: MyListInput,
): Promise<boolean> {
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const itemId = buildItemId(media.type, media.tmdbId);
  const reference = doc(db, "users", userId, "mi_lista", itemId);
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
    estado: "por_ver",
    calificacion: null,
    comentario: "",
    agregadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
    vistaEn: null,
    generos: media.generos,
    duracionMin: media.duracionMin,
    directores: media.directores,
  });

  return true;
}

export async function listUserItems(userId: string): Promise<MyListItem[]> {
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const itemsRef = collection(db, "users", userId, "mi_lista");
  const orderedQuery = query(itemsRef, orderBy("agregadoEn", "desc"));
  const snapshot = await getDocs(orderedQuery);

  return snapshot.docs.map((document) =>
    normalizeFirestoreItem(
      document.id,
      document.data() as Record<string, unknown>,
    ),
  );
}

export async function updateListItem(
  userId: string,
  itemId: string,
  updates: Partial<
    Omit<
      MyListItem,
      "id" | "tmdbId" | "type" | "title" | "year" | "posterPath" | "agregadoEn"
    >
  >,
): Promise<void> {
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const reference = doc(db, "users", userId, "mi_lista", itemId);
  const data: Record<string, unknown> = {
    ...updates,
    actualizadoEn: serverTimestamp(),
  };

  if (typeof updates.estado === "string") {
    const current = await getDoc(reference);
    const currentEstado = current.exists()
      ? (current.data().estado as WatchStatus | undefined)
      : undefined;

    const transition = vistaEnTransition(
      currentEstado ?? "por_ver",
      updates.estado,
    );
    if (transition === "set-server-now") {
      data.vistaEn = serverTimestamp();
    } else if (transition === "clear") {
      data.vistaEn = null;
    }
  }

  await updateDoc(reference, data);
}

export async function migrateMissingVistaEn(userId: string): Promise<number> {
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const itemsRef = collection(db, "users", userId, "mi_lista");
  const snapshot = await getDocs(itemsRef);
  let migrated = 0;

  for (const document of snapshot.docs) {
    const data = document.data();
    if (data.estado === "vista" && data.vistaEn == null) {
      await updateDoc(document.ref, {
        vistaEn: data.actualizadoEn ?? serverTimestamp(),
      });
      migrated += 1;
    }
  }

  return migrated;
}

export async function updateTMDBMetadata(
  userId: string,
  itemId: string,
  metadata: {
    generos: string[];
    duracionMin: number | null;
    directores: string[];
  },
): Promise<void> {
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  await updateDoc(doc(db, "users", userId, "mi_lista", itemId), {
    ...metadata,
    actualizadoEn: serverTimestamp(),
  });
}

export async function removeListItem(
  userId: string,
  itemId: string,
): Promise<void> {
  if (!db) {
    throw new Error("Firebase no está configurado.");
  }

  const reference = doc(db, "users", userId, "mi_lista", itemId);
  await deleteDoc(reference);
}

export function mapMediaDetailToInput(media: MediaDetail): MyListInput {
  return {
    tmdbId: media.id,
    type: media.mediaType,
    title: media.title,
    year: media.year,
    posterPath: media.posterPath,
    generos: media.generos,
    duracionMin: media.duracionMin,
    directores: media.directores,
  };
}
