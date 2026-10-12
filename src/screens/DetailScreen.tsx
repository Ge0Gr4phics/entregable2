import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { SearchStackParamList } from '../navigation/AppNavigator';
import { mapMediaDetailToInput } from '../services/myListService';
import { buildPosterUrl, getMediaDetail } from '../services/tmdbService';
import { MediaDetail, MediaType } from '../types';

interface DetailScreenProps {
  route: RouteProp<SearchStackParamList, 'Detail'>;
  navigation: NativeStackNavigationProp<SearchStackParamList, 'Detail'>;
}

export function DetailScreen({ route }: DetailScreenProps): React.ReactElement {
  const { mediaType, tmdbId, title } = route.params;
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToList, isOffline } = useAppContext();

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
          setError(caughtError instanceof Error ? caughtError.message : 'Error al cargar la obra');
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

  const handleAddToList = async (): Promise<void> => {
    if (!detail) {
      return;
    }

    if (isOffline) {
      Alert.alert('Sin conexión', 'La app está sin internet. Revisa la conexión antes de agregar elementos.');
      return;
    }

    const added = await addToList(mapMediaDetailToInput(detail));

    if (added) {
      Alert.alert('Añadido', `${detail.title} se agregó a Mi lista.`);
      return;
    }

    Alert.alert('Duplicado', 'Esta obra ya existe en tu lista personal.');
  };

  const posterUrl = detail ? buildPosterUrl(detail.posterPath, 'w500') : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterPlaceholderText}>Sin póster</Text>
          </View>
        )}

        <View style={styles.headerText}>
          <Text style={styles.title}>{detail?.title ?? title}</Text>
          <Text style={styles.meta}>{detail?.year ?? 'Sin año'}</Text>
          <Text style={styles.meta}>TMDB: {detail?.voteAverage ? `${detail.voteAverage.toFixed(1)}/10` : 'Sin valoración'}</Text>
        </View>
      </View>

      {loading ? <Text style={styles.status}>Cargando detalle...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && detail ? (
        <>
          <Pressable style={styles.primaryButton} onPress={handleAddToList}>
            <Text style={styles.primaryButtonText}>Agregar a Mi lista</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.bodyText}>{detail.overview}</Text>

          <Text style={styles.sectionTitle}>Elenco</Text>
          {detail.cast.length > 0 ? (
            detail.cast.map((person, index) => (
              <Text key={`${person.name}-${index}`} style={styles.castItem}>
                {person.name} como {person.character}
              </Text>
            ))
          ) : (
            <Text style={styles.bodyText}>No hay información de reparto disponible.</Text>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  poster: {
    width: 150,
    height: 220,
    borderRadius: 16,
  },
  posterPlaceholder: {
    width: 150,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#2d3a56',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    color: '#dae4ff',
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    color: '#f3f6fb',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    color: '#b1c0df',
    fontSize: 15,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#f3f6fb',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    color: '#e4eaf8',
    fontSize: 15,
    lineHeight: 22,
  },
  castItem: {
    color: '#dfe7fb',
    fontSize: 14,
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: '#2eb67d',
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  status: {
    color: '#bfe3ff',
    marginBottom: 10,
  },
  errorText: {
    color: '#ffb1b6',
    marginBottom: 12,
  },
});
