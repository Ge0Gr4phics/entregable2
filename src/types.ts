export type MediaType = 'movie' | 'tv';
export type WatchStatus = 'por_ver' | 'viendo' | 'vista';

export interface MediaSearchResult {
  id: number;
  media_type: MediaType | 'person';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
}

export interface MediaDetail {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  cast: Array<{ name: string; character: string }>;
}

export interface MyListItem {
  id: string;
  tmdbId: number;
  type: MediaType;
  title: string;
  year: string;
  posterPath: string | null;
  estado: WatchStatus;
  calificacion: number | null;
  comentario: string;
  agregadoEn: string | null;
}

export interface MyListInput {
  tmdbId: number;
  type: MediaType;
  title: string;
  year: string;
  posterPath: string | null;
}
