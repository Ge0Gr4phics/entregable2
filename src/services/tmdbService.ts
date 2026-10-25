import { tmdbAccessToken } from '../config/env';
import { MediaDetail, MediaSearchResult, MediaType } from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_LANGUAGE = 'es-ES';

function createHeaders(): Record<string, string> {
  if (!tmdbAccessToken) {
    throw new Error('Falta la configuración de TMDB. Añade EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN al archivo .env.');
  }

  return {
    Authorization: `Bearer ${tmdbAccessToken}`,
    accept: 'application/json',
  };
}

function getTitle(item: Record<string, unknown>): string {
  const title = typeof item.title === 'string' ? item.title : typeof item.name === 'string' ? item.name : 'Sin título';
  return title;
}

function getYear(item: Record<string, unknown>): string {
  const releaseDate = typeof item.release_date === 'string' ? item.release_date : typeof item.first_air_date === 'string' ? item.first_air_date : '';
  return releaseDate ? releaseDate.slice(0, 4) : 'Sin año';
}

function normalizeSearchResult(item: Record<string, unknown>): MediaSearchResult | null {
  const mediaType = item.media_type;

  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return null;
  }

  const id = typeof item.id === 'number' ? item.id : Number(item.id ?? 0);
  if (!id) {
    return null;
  }

  return {
    id,
    media_type: mediaType,
    title: typeof item.title === 'string' ? item.title : undefined,
    name: typeof item.name === 'string' ? item.name : undefined,
    release_date: typeof item.release_date === 'string' ? item.release_date : undefined,
    first_air_date: typeof item.first_air_date === 'string' ? item.first_air_date : undefined,
    overview: typeof item.overview === 'string' ? item.overview : undefined,
    poster_path: typeof item.poster_path === 'string' ? item.poster_path : null,
    backdrop_path: typeof item.backdrop_path === 'string' ? item.backdrop_path : null,
  };
}

function normalizeTrendingResult(item: Record<string, unknown>): MediaSearchResult | null {
  const mediaType = item.media_type;
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return null;
  }

  return normalizeSearchResult(item);
}

export function buildPosterUrl(posterPath: string | null, size = 'w342'): string | null {
  if (!posterPath) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export async function getTrendingMedia(): Promise<MediaSearchResult[]> {
  const response = await fetch(`${TMDB_BASE_URL}/trending/all/week?language=${TMDB_LANGUAGE}`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar las tendencias.');
  }

  const json = (await response.json()) as { results?: Array<Record<string, unknown>> };
  return (Array.isArray(json.results) ? json.results : [])
    .map(normalizeTrendingResult)
    .filter((item): item is MediaSearchResult => item !== null);
}

export async function getRandomMovie(): Promise<MediaSearchResult> {
  const page = Math.floor(Math.random() * 500) + 1;
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?language=${TMDB_LANGUAGE}&page=${page}`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('No se pudo elegir una película aleatoria.');
  }

  const json = (await response.json()) as { results?: Array<Record<string, unknown>> };
  const movies = (Array.isArray(json.results) ? json.results : [])
    .map((item) => normalizeSearchResult({ ...item, media_type: 'movie' }))
    .filter((item): item is MediaSearchResult => item !== null);

  if (movies.length === 0) {
    throw new Error('No se encontró una película para elegir.');
  }

  return movies[Math.floor(Math.random() * movies.length)];
}

export async function searchMediaByTitle(query: string): Promise<MediaSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    query: query.trim(),
    include_adult: 'false',
    language: TMDB_LANGUAGE,
    page: '1',
  });

  const response = await fetch(`${TMDB_BASE_URL}/search/multi?${params.toString()}`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('No se pudo completar la búsqueda.');
  }

  const json = (await response.json()) as { results?: Array<Record<string, unknown>> };
  const results = Array.isArray(json.results) ? json.results : [];

  return results
    .map((item) => normalizeSearchResult(item))
    .filter((item): item is MediaSearchResult => item !== null);
}

export async function getMediaDetail(type: MediaType, tmdbId: number): Promise<MediaDetail> {
  const response = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}?language=${TMDB_LANGUAGE}&append_to_response=credits`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar la información de la obra.');
  }

  const detail = (await response.json()) as Record<string, unknown>;

  const credits = detail.credits as Record<string, unknown> | undefined;
  const rawCast = credits && typeof credits === 'object' ? (credits.cast as unknown[] | undefined) : undefined;
  const castItems = Array.isArray(rawCast)
    ? rawCast
        .map((person) => {
          const item = person as Record<string, unknown>;
          const name = typeof item.name === 'string' ? item.name : 'Actor desconocido';
          const character = typeof item.character === 'string' ? item.character : 'Sin personaje';
          return { name, character };
        })
        .slice(0, 8)
    : [];

  const title = getTitle(detail);
  const overview = typeof detail.overview === 'string' && detail.overview.trim().length > 0 ? detail.overview : 'Sin sinopsis disponible.';
  const year = getYear(detail);

  return {
    id: tmdbId,
    mediaType: type,
    title,
    year,
    posterPath: typeof detail.poster_path === 'string' ? detail.poster_path : null,
    backdropPath: typeof detail.backdrop_path === 'string' ? detail.backdrop_path : null,
    overview,
    voteAverage: typeof detail.vote_average === 'number' ? detail.vote_average : 0,
    cast: castItems,
  };
}
