import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { MyListStackParamList } from '../navigation/AppNavigator';
import { buildPosterUrl } from '../services/tmdbService';
import { MediaType, MyListItem, WatchStatus } from '../types';

interface MyListScreenProps {
  navigation: NativeStackNavigationProp<MyListStackParamList, 'MyList'>;
}

const watchStatuses: Array<{ label: string; value: 'all' | WatchStatus }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Por ver', value: 'por_ver' },
  { label: 'Viendo', value: 'viendo' },
  { label: 'Vista', value: 'vista' },
];

const mediaTypes: Array<{ label: string; value: 'all' | MediaType }> = [
  { label: 'Todo', value: 'all' },
  { label: 'Películas', value: 'movie' },
  { label: 'Series', value: 'tv' },
];

export function MyListScreen({ navigation }: MyListScreenProps): React.ReactElement {
  const { items, removeFromList, isOffline } = useAppContext();
  const [stateFilter, setStateFilter] = useState<'all' | WatchStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | MediaType>('all');

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesState = stateFilter === 'all' || item.estado === stateFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesState && matchesType;
      }),
    [items, stateFilter, typeFilter],
  );

  const handleRemove = (item: MyListItem): void => {
    Alert.alert('Confirmar', `¿Quieres quitar "${item.title}" de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          void removeFromList(item.id);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mi lista personal</Text>
      {isOffline ? <Text style={styles.offlineBadge}>Sin conexión: mostrando la última copia local.</Text> : null}

      <View style={styles.filterRow}>
        {watchStatuses.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.filterChip, stateFilter === option.value && styles.filterChipSelected]}
            onPress={() => setStateFilter(option.value)}
          >
            <Text style={[styles.filterChipText, stateFilter === option.value && styles.filterChipTextSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        {mediaTypes.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.filterChip, typeFilter === option.value && styles.filterChipSelected]}
            onPress={() => setTypeFilter(option.value)}
          >
            <Text style={[styles.filterChipText, typeFilter === option.value && styles.filterChipTextSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.posterPath ? (
              <Image source={{ uri: buildPosterUrl(item.posterPath, 'w185') ?? undefined }} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Text style={styles.posterPlaceholderText}>Sin póster</Text>
              </View>
            )}

            <View style={styles.cardBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.year}</Text>
              <Text style={styles.meta}>Estado: {item.estado}</Text>
              {item.calificacion !== null ? <Text style={styles.meta}>Puntuación: {item.calificacion}/5</Text> : null}
              <Text style={styles.meta}>Tipo: {item.type === 'movie' ? 'Película' : 'Serie'}</Text>

              <View style={styles.actions}>
                <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('EditEntry', { itemId: item.id })}>
                  <Text style={styles.secondaryButtonText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => handleRemove(item)}>
                  <Text style={styles.deleteButtonText}>Quitar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay elementos en esta vista.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f3f6fb',
    marginBottom: 12,
  },
  offlineBadge: {
    backgroundColor: '#3a2c1b',
    color: '#f7d299',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#1d2940',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: '#5B8DEF',
  },
  filterChipText: {
    color: '#dfe7fb',
    fontSize: 12,
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
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
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  title: {
    color: '#f3f6fb',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#dbe7ff',
    fontSize: 13,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#2eb67d',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#d9485f',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#dfe7fb',
    textAlign: 'center',
    marginTop: 24,
  },
});
