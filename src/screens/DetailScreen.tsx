import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';

import { useAppContext } from '../context/AppContext';
import { MyListStackParamList, SearchStackParamList } from '../navigation/AppNavigator';
import { mapMediaDetailToInput } from '../services/myListService';
import { getPosterPalette } from '../services/posterPalette';
import { buildPosterUrl, getMediaDetail } from '../services/tmdbService';
import { colors } from '../theme';
import { MediaDetail } from '../types';

interface DetailScreenProps {
  route: RouteProp<SearchStackParamList, 'Detail'> | RouteProp<MyListStackParamList, 'Detail'>;
}

interface PosterTheme {
  imageUrl: string;
  background: string;
  surface: string;
}

const defaultPosterTheme: PosterTheme = {
  imageUrl: '',
  background: colors.background,
  surface: colors.surface,
};

function isHexColor(value: string | undefined): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value));
}

function toRgba(hex: string, opacity: number): string {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export function DetailScreen({ route }: DetailScreenProps): React.ReactElement {
  const { mediaType, tmdbId, title } = route.params;
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posterTheme, setPosterTheme] = useState<PosterTheme>(defaultPosterTheme);
  const { addToList, isOffline, myList } = useAppContext();

  useEffect(() => {
    let active = true;

    async function loadDetail(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const mediaDetail = await getMediaDetail(mediaType, tmdbId);
        if (active) {
          setDetail(mediaDetail);
        }
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : 'Error al cargar la obra.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDetail();
    return () => {
      active = false;
    };
  }, [mediaType, tmdbId]);

  const isAlreadyAdded = myList.some((item) => item.tmdbId === tmdbId);

  const handleAddToList = async (): Promise<void> => {
    if (!detail) {
      return;
    }

    if (isOffline) {
      Alert.alert('Sin conexión', 'Revisa la conexión antes de agregar elementos.');
      return;
    }

    try {
      const added = await addToList(mapMediaDetailToInput(detail));
      if (added) {
        Alert.alert('Añadido', `${detail.title} se agregó a Mi lista.`);
        return;
      }

      Alert.alert('Duplicado', 'Esta obra ya existe en tu lista personal.');
    } catch (error) {
      Alert.alert(
        'No se pudo agregar',
        error instanceof Error ? error.message : 'Revisa tu conexión e inténtalo de nuevo.',
      );
    }
  };

  const posterUrl = detail ? buildPosterUrl(detail.posterPath, 'w500') : null;
  const backdropUrl = detail
    ? buildPosterUrl(detail.backdropPath ?? detail.posterPath, 'w780')
    : null;

  useEffect(() => {
    let active = true;
    if (!posterUrl) {
      return () => {
        active = false;
      };
    }
    const imageUrl = posterUrl;

    async function loadPosterColors(): Promise<void> {
      try {
        const palette = await getPosterPalette(imageUrl);
        if (!active) {
          return;
        }

        const baseColor = palette.dominant;
        const hasPosterColors = isHexColor(baseColor);

        setPosterTheme({
          imageUrl,
          background: hasPosterColors ? toRgba(baseColor, 0.46) : defaultPosterTheme.background,
          surface: hasPosterColors ? toRgba(baseColor, 0.22) : defaultPosterTheme.surface,
        });
      } catch (caughtError) {
        if (active) {
          console.warn('No se pudieron extraer los colores del póster.', caughtError);
        }
      }
    }

    void loadPosterColors();
    return () => {
      active = false;
    };
  }, [mediaType, posterUrl, tmdbId]);

  const activePosterTheme = posterTheme.imageUrl === posterUrl ? posterTheme : defaultPosterTheme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: activePosterTheme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {backdropUrl ? <Image source={{ uri: backdropUrl }} style={styles.heroImage} resizeMode="cover" /> : null}
        <View style={styles.heroShade} />
        <View style={styles.heroTopline}>
          <Text style={styles.heroEyebrow}>{mediaType === 'movie' ? 'PELÍCULA' : 'SERIE'}  ·  {detail?.year ?? ''}</Text>
          {detail && detail.voteAverage > 0 ? (
            <View style={styles.rating}><Text style={styles.ratingText}>★ {detail.voteAverage.toFixed(1)}</Text></View>
          ) : null}
        </View>
        <Text style={styles.heroTitle}>{detail?.title ?? title}</Text>
        <Text style={styles.heroCaption}>UNA HISTORIA PARA RECORDAR</Text>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.accent} /><Text style={styles.status}>Cargando detalle...</Text></View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && detail ? (
        <View style={styles.details}>
          <View style={styles.infoRow}>
            {posterUrl ? (
              <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={styles.posterPlaceholder}><Text style={styles.placeholderText}>SIN PÓSTER</Text></View>
            )}
            <View style={styles.infoCopy}>
              <Text style={styles.sectionEyebrow}>EL CARTEL</Text>
              <Text style={styles.infoTitle}>{detail.title}</Text>
              <Text style={styles.infoMeta}>{detail.year}  ·  {mediaType === 'movie' ? 'Película' : 'Serie'}</Text>
              {detail.voteAverage > 0 ? <Text style={styles.infoRating}>★  {detail.voteAverage.toFixed(1)} / 10</Text> : null}
            </View>
          </View>

          <Pressable
            style={[
              styles.primaryButton,
              { backgroundColor: colors.accent },
              isAlreadyAdded && styles.disabledButton,
            ]}
            onPress={() => void handleAddToList()}
            disabled={isAlreadyAdded}
          >
            <Text style={styles.primaryButtonText}>
              {isAlreadyAdded ? '✓  AGREGADA A MI LISTA' : '+  AGREGAR A MI LISTA'}
            </Text>
          </Pressable>

          <View style={[styles.section, { backgroundColor: activePosterTheme.surface }]}>
            <Text style={styles.sectionEyebrow}>DE QUÉ TRATA</Text>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.bodyText}>{detail.overview}</Text>
          </View>

          <View style={styles.castSection}>
            <Text style={styles.sectionEyebrow}>QUIÉNES LE DAN VIDA</Text>
            <Text style={styles.sectionTitle}>Elenco</Text>
            {detail.cast.length > 0 ? (
              detail.cast.map((person, index) => (
                <View key={`${person.name}-${index}`} style={styles.castItem}>
                  <View style={styles.castDot} />
                  <View style={styles.castCopy}>
                    <Text style={styles.castName}>{person.name}</Text>
                    <Text style={styles.castCharacter}>{person.character}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.bodyText}>No hay información de reparto disponible.</Text>
            )}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  hero: { height: 310, justifyContent: 'flex-end', padding: 22, overflow: 'hidden', backgroundColor: '#242424' },
  heroImage: { ...StyleSheet.absoluteFill },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 15, 15, 0.3)' },
  heroTopline: { position: 'absolute', top: 18, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroEyebrow: { color: colors.paper, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  rating: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: 'rgba(20,24,17,0.72)' },
  ratingText: { color: colors.paper, fontSize: 11, fontWeight: '700' },
  heroTitle: { color: colors.text, fontSize: 38, lineHeight: 42, fontWeight: '800', maxWidth: '95%' },
  heroCaption: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginTop: 9 },
  loading: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 20 },
  status: { color: colors.paper, marginLeft: 10, fontSize: 13 },
  errorText: { color: colors.dangerLight, padding: 20, fontSize: 14 },
  details: { paddingHorizontal: 20, paddingTop: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  poster: { width: 100, height: 148, borderRadius: 12, backgroundColor: colors.surfaceRaised },
  posterPlaceholder: { width: 100, height: 148, borderRadius: 12, backgroundColor: colors.surfaceRaised, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: colors.muted, fontSize: 9 },
  infoCopy: { flex: 1, paddingLeft: 16 },
  sectionEyebrow: { color: '#d6d6b5', fontSize: 9, fontWeight: '800', letterSpacing: 1.7 },
  infoTitle: { color: colors.text, fontSize: 20, lineHeight: 24, fontWeight: '700', marginTop: 7 },
  infoMeta: { color: '#e0dfce', fontSize: 13, marginTop: 7 },
  infoRating: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 9 },
  primaryButton: { minHeight: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  disabledButton: { backgroundColor: '#576348' },
  primaryButtonText: { color: colors.textDark, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  section: { padding: 17, borderRadius: 14 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 10 },
  bodyText: { color: '#f0efe4', fontSize: 14, lineHeight: 22 },
  castSection: { marginTop: 25 },
  castItem: { minHeight: 55, borderBottomWidth: 1, borderBottomColor: 'rgba(245,242,233,0.15)', flexDirection: 'row', alignItems: 'center' },
  castDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, marginRight: 12 },
  castCopy: { flex: 1 },
  castName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  castCharacter: { color: '#d6d7c9', fontSize: 11, marginTop: 3 },
});
