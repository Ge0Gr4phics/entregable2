import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { MyListStackParamList } from '../navigation/AppNavigator';
import { buildPosterUrl } from '../services/tmdbService';
import { colors } from '../theme';
import { MediaType, MyListItem, WatchStatus } from '../types';

interface MyListScreenProps {
  navigation: NativeStackNavigationProp<MyListStackParamList, 'MyList'>;
}

const watchStatuses: { label: string; value: 'all' | WatchStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Por ver', value: 'por_ver' },
  { label: 'Viendo', value: 'viendo' },
  { label: 'Vista', value: 'vista' },
];

const mediaTypes: { label: string; value: 'all' | MediaType }[] = [
  { label: 'Todo', value: 'all' },
  { label: 'Películas', value: 'movie' },
  { label: 'Series', value: 'tv' },
];

function ticketDate(value: string | null): { day: string; month: string; year: string } {
  if (!value) {
    return { day: '--', month: 'SIN FECHA', year: '' };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: 'SIN FECHA', year: '' };
  }

  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString('es', { month: 'short' }).replace('.', '').toUpperCase(),
    year: String(date.getFullYear()),
  };
}

export function MyListScreen({ navigation }: MyListScreenProps): React.ReactElement {
  const { items, removeFromList, isOffline, listError } = useAppContext();
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
        onPress: async () => {
          try {
            await removeFromList(item.id);
          } catch (error) {
            Alert.alert(
              'No se pudo quitar',
              error instanceof Error ? error.message : 'Revisa tu conexión e inténtalo de nuevo.',
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>TU COLECCIÓN PERSONAL</Text>
      <Text style={styles.header}>Mi lista</Text>
      {isOffline ? <Text style={styles.offlineBadge}>Sin conexión: mostrando la última copia local.</Text> : null}
      {listError ? <Text style={styles.errorMessage}>{listError}</Text> : null}

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
          <View style={styles.ticket}>
            <Pressable
              style={styles.posterPanel}
              onPress={() => navigation.navigate('Detail', { mediaType: item.type, tmdbId: item.tmdbId, title: item.title })}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalle de ${item.title}`}
            >
              {item.posterPath ? (
                <Image source={{ uri: buildPosterUrl(item.posterPath, 'w185') ?? undefined }} style={styles.poster} resizeMode="cover" />
              ) : (
                <View style={styles.posterPlaceholder}><Text style={styles.posterPlaceholderText}>SIN PÓSTER</Text></View>
              )}
            </Pressable>

            <View style={styles.ticketBody}>
              <View style={styles.perforation}>
                {Array.from({ length: 9 }, (_, index) => <View key={index} style={styles.perforationDot} />)}
              </View>
              <Text style={styles.typeLabel}>{item.type === 'movie' ? 'PELÍCULA' : 'SERIE'}  ·  {item.year}</Text>
              <Pressable
                onPress={() => navigation.navigate('Detail', { mediaType: item.type, tmdbId: item.tmdbId, title: item.title })}
                accessibilityRole="button"
                accessibilityLabel={`Ver detalle de ${item.title}`}
              >
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              </Pressable>
              <Text style={styles.meta}>{item.estado.replace('_', ' ').toUpperCase()}{item.calificacion !== null ? `  ·  ${item.calificacion}/5` : ''}</Text>
              {item.comentario.trim() ? (
                <View style={styles.comment}>
                  <Text style={styles.commentLabel}>COMENTARIO</Text>
                  <Text style={styles.commentText} numberOfLines={2} ellipsizeMode="tail">{item.comentario.trim()}</Text>
                </View>
              ) : null}
              <View style={styles.actions}>
                <Pressable style={styles.editButton} onPress={() => navigation.navigate('EditEntry', { itemId: item.id })}>
                  <Text style={styles.editButtonText}>EDITAR</Text>
                </Pressable>
                <Pressable style={styles.removeButton} onPress={() => handleRemove(item)}>
                  <Text style={styles.removeButtonText}>QUITAR</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.datePanel}>
              <View style={styles.dateDivider} />
              <Text style={styles.month}>{ticketDate(item.agregadoEn).month}</Text>
              <Text style={styles.day}>{ticketDate(item.agregadoEn).day}</Text>
              <Text style={styles.year}>{ticketDate(item.agregadoEn).year}</Text>
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
    backgroundColor: colors.oliveDark,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  kicker: {
    color: '#c8d0b4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 5,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  offlineBadge: {
    backgroundColor: '#4c4227',
    color: '#f4dda1',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  errorMessage: {
    color: '#ffd0c8',
    backgroundColor: '#542d2c',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.accent,
  },
  filterChipText: {
    color: '#edf0e5',
    fontSize: 12,
  },
  filterChipTextSelected: {
    color: colors.textDark,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 30,
  },
  ticket: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 14,
    minHeight: 144,
    shadowColor: '#10170d',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  posterPanel: {
    width: 94,
    padding: 7,
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  poster: {
    width: '100%',
    height: 130,
    borderRadius: 10,
  },
  posterPlaceholder: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    backgroundColor: colors.paperMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    color: colors.mutedDark,
    fontSize: 8,
    fontWeight: '700',
  },
  ticketBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingLeft: 17,
    paddingRight: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#d9d5ca',
    borderStyle: 'dashed',
  },
  perforation: {
    position: 'absolute',
    left: -3,
    top: 15,
    bottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  perforationDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.oliveDark,
  },
  typeLabel: {
    color: colors.olive,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  title: {
    color: colors.textDark,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  meta: {
    color: colors.mutedDark,
    fontSize: 9,
    fontWeight: '700',
  },
  comment: {
    marginTop: 7,
  },
  commentLabel: {
    color: colors.olive,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  commentText: {
    color: colors.textDark,
    fontSize: 10,
    lineHeight: 13,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 9,
  },
  editButton: {
    backgroundColor: colors.oliveDark,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 6,
  },
  editButtonText: {
    color: colors.paper,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  removeButton: {
    backgroundColor: colors.paperMuted,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  datePanel: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  dateDivider: {
    position: 'absolute',
    left: 0,
    height: '70%',
    borderLeftWidth: 1,
    borderLeftColor: '#b9b6ab',
    borderStyle: 'dotted',
  },
  month: {
    color: colors.mutedDark,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  day: {
    color: colors.textDark,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '300',
  },
  year: {
    color: colors.mutedDark,
    fontSize: 9,
  },
  emptyText: {
    color: '#e8eadf',
    textAlign: 'center',
    marginTop: 24,
  },
});
