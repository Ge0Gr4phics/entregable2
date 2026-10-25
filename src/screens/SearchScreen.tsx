import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppIcon } from '../components/AppIcon';
import { SearchStackParamList } from '../navigation/AppNavigator';
import { buildPosterUrl, getRandomMovie, getTrendingMedia, searchMediaByTitle } from '../services/tmdbService';
import { colors } from '../theme';
import { MediaSearchResult } from '../types';

interface SearchScreenProps {
  navigation: NativeStackNavigationProp<SearchStackParamList, 'Search'>;
}

function mediaTitle(item: MediaSearchResult): string {
  return item.title ?? item.name ?? 'Sin título';
}

function mediaYear(item: MediaSearchResult): string {
  const date = item.release_date ?? item.first_air_date;
  return date ? date.slice(0, 4) : 'Sin año';
}

export function SearchScreen({ navigation }: SearchScreenProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [trending, setTrending] = useState<MediaSearchResult[]>([]);
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTrending(): Promise<void> {
      setLoadingTrending(true);
      setTrendingError(null);
      try {
        const items = await getTrendingMedia();
        if (active) {
          setTrending(items);
        }
      } catch (caughtError) {
        if (active) {
          setTrendingError(caughtError instanceof Error ? caughtError.message : 'No se pudieron cargar las tendencias.');
        }
      } finally {
        if (active) {
          setLoadingTrending(false);
        }
      }
    }

    void loadTrending();
    return () => {
      active = false;
    };
  }, []);

  const openDetail = (item: MediaSearchResult): void => {
    const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
    navigation.navigate('Detail', { mediaType, tmdbId: item.id, title: mediaTitle(item) });
  };

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) {
      setResults([]);
      setError('Escribe un título para buscar.');
      return;
    }

    setLoadingSearch(true);
    setError(null);
    try {
      const items = await searchMediaByTitle(query);
      setResults(items);
      if (items.length === 0) {
        setError('No se encontraron resultados.');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Error de búsqueda.');
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleRandomMovie = async (): Promise<void> => {
    setLoadingRandom(true);
    setError(null);
    try {
      const item = await getRandomMovie();
      openDetail(item);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo elegir una película.');
    } finally {
      setLoadingRandom(false);
    }
  };

  const featured = trending[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>CINEMATECA</Text>
          <Text style={styles.topSubtitle}>Tu próxima historia empieza aquí</Text>
        </View>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View>
      </View>

      {featured ? (
        <Pressable style={styles.hero} onPress={() => openDetail(featured)}>
          {featured.backdrop_path ? (
            <Image source={{ uri: buildPosterUrl(featured.backdrop_path, 'w780') ?? undefined }} style={styles.heroImage} resizeMode="cover" />
          ) : featured.poster_path ? (
            <Image source={{ uri: buildPosterUrl(featured.poster_path, 'w500') ?? undefined }} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          <View style={styles.heroShade} />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>EN TENDENCIA ESTA SEMANA</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{mediaTitle(featured)}</Text>
            <Text style={styles.heroMeta}>{mediaYear(featured)}  ·  {featured.media_type === 'tv' ? 'SERIE' : 'PELÍCULA'}</Text>
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>DESCUBRIR</Text>
              <AppIcon name="chevron" color={colors.text} size={14} />
            </View>
          </View>
        </Pressable>
      ) : (
        <View style={[styles.hero, styles.heroPlaceholder]}>
          {loadingTrending ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.heroPlaceholderText}>Tendencias de cine y series</Text>}
        </View>
      )}

      {trendingError ? <Text style={styles.errorText}>{trendingError}</Text> : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>LO QUE TODOS ESTÁN VIENDO</Text>
          <Text style={styles.sectionTitle}>En tendencia</Text>
        </View>
        {loadingTrending ? <ActivityIndicator color={colors.accent} /> : null}
      </View>

      {trending.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingList}>
          {trending.slice(0, 12).map((item, index) => {
            const poster = buildPosterUrl(item.poster_path ?? null, 'w342');
            return (
              <Pressable key={`${item.media_type}_${item.id}`} style={styles.trendingCard} onPress={() => openDetail(item)}>
                <View style={styles.posterWrap}>
                  {poster ? <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" /> : <View style={styles.posterPlaceholder}><Text style={styles.placeholderLabel}>SIN PÓSTER</Text></View>}
                  <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>{mediaTitle(item)}</Text>
                <Text style={styles.trendingMeta}>{mediaYear(item)} · {item.media_type === 'tv' ? 'Serie' : 'Película'}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : !loadingTrending ? <Text style={styles.emptyText}>No hay títulos disponibles por ahora.</Text> : null}

      <Pressable style={styles.randomButton} onPress={() => void handleRandomMovie()} disabled={loadingRandom}>
        {loadingRandom ? <ActivityIndicator color={colors.textDark} /> : <AppIcon name="sparkle" color={colors.textDark} size={26} />}
        <View style={styles.randomCopy}>
          <Text style={styles.randomTitle}>Sorpréndeme</Text>
          <Text style={styles.randomSubtitle}>Elige una película al azar</Text>
        </View>
        <AppIcon name="arrowUpRight" color={colors.textDark} size={22} />
      </Pressable>

      <View style={styles.searchSection}>
        <Text style={styles.sectionEyebrow}>¿TIENES ALGO EN MENTE?</Text>
        <Text style={styles.sectionTitle}>Buscar una película o serie</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Título, actor o historia"
            placeholderTextColor={colors.mutedDark}
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={() => void handleSearch()}
          />
          <Pressable style={styles.searchButton} onPress={() => void handleSearch()}>
            <Text style={styles.searchButtonText}>BUSCAR</Text>
          </Pressable>
        </View>
        {loadingSearch ? <ActivityIndicator color={colors.accent} style={styles.searchLoader} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {results.map((item) => {
          const poster = buildPosterUrl(item.poster_path ?? null, 'w342');
          return (
            <Pressable key={`${item.media_type}_${item.id}`} style={styles.resultCard} onPress={() => openDetail(item)}>
              {poster ? <Image source={{ uri: poster }} style={styles.resultPoster} resizeMode="cover" /> : <View style={styles.resultPosterPlaceholder} />}
              <View style={styles.resultCopy}>
                <Text style={styles.resultTitle} numberOfLines={2}>{mediaTitle(item)}</Text>
                <Text style={styles.resultMeta}>{mediaYear(item)} · {item.media_type === 'tv' ? 'Serie' : 'Película'}</Text>
              </View>
              <AppIcon name="chevron" color={colors.accent} size={20} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 36 },
  topBar: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  topSubtitle: { color: colors.muted, fontSize: 12, marginTop: 5 },
  brandMark: { width: 38, height: 38, borderColor: colors.olive, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: colors.accent, fontSize: 20, fontWeight: '600' },
  hero: { marginHorizontal: 16, height: 320, borderRadius: 18, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surfaceRaised },
  heroImage: { ...StyleSheet.absoluteFill },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 13, 9, 0.48)' },
  heroContent: { padding: 22 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: colors.text, fontSize: 34, lineHeight: 38, fontWeight: '800', marginTop: 8, maxWidth: '90%' },
  heroMeta: { color: colors.paperMuted, fontSize: 12, letterSpacing: 1, marginTop: 8 },
  heroButton: { flexDirection: 'row', alignItems: 'center', marginTop: 16, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(245,242,233,0.8)', paddingHorizontal: 15, paddingVertical: 9, alignSelf: 'flex-start' },
  heroButtonText: { color: colors.text, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroPlaceholderText: { color: colors.muted, fontSize: 14 },
  sectionHeader: { paddingHorizontal: 22, marginTop: 28, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionEyebrow: { color: colors.olive, fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  sectionTitle: { color: colors.text, fontSize: 23, fontWeight: '700', marginTop: 4 },
  trendingList: { paddingHorizontal: 18, paddingBottom: 4 },
  trendingCard: { width: 132, marginHorizontal: 5 },
  posterWrap: { height: 194, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surfaceRaised },
  poster: { width: '100%', height: '100%' },
  posterPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  placeholderLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1 },
  rank: { position: 'absolute', left: 8, bottom: 7, color: colors.paper, fontSize: 21, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 8 },
  trendingTitle: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 9 },
  trendingMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  randomButton: { backgroundColor: colors.accent, minHeight: 78, marginHorizontal: 20, marginTop: 25, borderRadius: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  randomCopy: { flex: 1, marginLeft: 8 },
  randomTitle: { color: colors.textDark, fontSize: 16, fontWeight: '800' },
  randomSubtitle: { color: '#565342', fontSize: 12, marginTop: 3 },
  searchSection: { paddingHorizontal: 22, marginTop: 32 },
  searchRow: { flexDirection: 'row', marginTop: 13 },
  input: { flex: 1, minHeight: 48, backgroundColor: colors.paper, borderRadius: 11, paddingHorizontal: 14, color: colors.textDark, fontSize: 14 },
  searchButton: { minHeight: 48, paddingHorizontal: 14, backgroundColor: colors.oliveDark, borderRadius: 11, justifyContent: 'center', marginLeft: 8 },
  searchButtonText: { color: colors.paper, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  searchLoader: { marginTop: 16 },
  errorText: { color: colors.dangerLight, marginHorizontal: 22, marginTop: 12, fontSize: 13 },
  emptyText: { color: colors.muted, marginHorizontal: 22, fontSize: 13 },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 9, marginTop: 10 },
  resultPoster: { width: 54, height: 74, borderRadius: 7, backgroundColor: colors.surfaceRaised },
  resultPosterPlaceholder: { width: 54, height: 74, borderRadius: 7, backgroundColor: colors.surfaceRaised },
  resultCopy: { flex: 1, paddingHorizontal: 12 },
  resultTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  resultMeta: { color: colors.muted, fontSize: 12, marginTop: 5 },
});
