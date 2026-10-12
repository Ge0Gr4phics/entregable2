import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SearchStackParamList } from '../navigation/AppNavigator';
import { buildPosterUrl, searchMediaByTitle } from '../services/tmdbService';
import { MediaSearchResult } from '../types';

interface SearchScreenProps {
  navigation: NativeStackNavigationProp<SearchStackParamList, 'Search'>;
}

export function SearchScreen({ navigation }: SearchScreenProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) {
      setResults([]);
      setError('Ingresa un título para buscar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await searchMediaByTitle(query);
      setResults(items);
      if (items.length === 0) {
        setError('No se encontraron resultados.');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Error de búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: MediaSearchResult }): React.ReactElement => {
    const title = item.title ?? item.name ?? 'Sin título';
    const year = item.release_date ? item.release_date.slice(0, 4) : item.first_air_date ? item.first_air_date.slice(0, 4) : 'Sin año';
    const posterUrl = buildPosterUrl(item.poster_path ?? null, 'w342');
    const mediaType = item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : 'movie';

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { mediaType, tmdbId: item.id, title })}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterPlaceholderText}>Sin póster</Text>
          </View>
        )}
        <View style={styles.cardTextContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{year}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Buscar películas y series</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Escribe el título"
          style={styles.input}
          onSubmitEditing={handleSearch}
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5B8DEF" style={styles.loader} />
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.media_type}_${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f3f6fb',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F7FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#5B8DEF',
    paddingHorizontal: 16,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  loader: {
    marginVertical: 12,
  },
  errorText: {
    color: '#ffadad',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1d2940',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 120,
  },
  poster: {
    width: 90,
    height: 120,
  },
  posterPlaceholder: {
    width: 90,
    height: 120,
    backgroundColor: '#2d3a56',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    color: '#dae4ff',
    fontSize: 12,
    textAlign: 'center',
  },
  cardTextContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#f3f6fb',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: '#93a7cc',
    fontSize: 14,
  },
});
