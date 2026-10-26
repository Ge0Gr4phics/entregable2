import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { MyListStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme';
import { WatchStatus } from '../types';

interface EditEntryScreenProps {
  route: RouteProp<MyListStackParamList, 'EditEntry'>;
  navigation: NativeStackNavigationProp<MyListStackParamList, 'EditEntry'>;
}

export function EditEntryScreen({ route, navigation }: EditEntryScreenProps): React.ReactElement {
  const { items, updateEntry, removeFromList } = useAppContext();
  const item = items.find((currentItem) => currentItem.id === route.params.itemId) ?? null;
  const [estado, setEstado] = useState<WatchStatus>(item?.estado ?? 'por_ver');
  const [calificacion, setCalificacion] = useState<number | null>(item?.calificacion ?? null);
  const [comentario, setComentario] = useState(item?.comentario ?? '');
  const [saving, setSaving] = useState(false);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No se encontró la entrada para editar.</Text>
      </View>
    );
  }

  const handleSave = async (): Promise<void> => {
    if (estado === 'vista' && calificacion === null) {
      Alert.alert('Falta la calificación', 'Elige una calificación para marcar esta obra como vista.');
      return;
    }

    setSaving(true);
    const normalizedComment = comentario.slice(0, 500);
    const nextCalificacion = estado === 'vista' ? calificacion : null;

    try {
      await updateEntry(item.id, {
        estado,
        calificacion: nextCalificacion,
        comentario: normalizedComment,
      });

      Alert.alert('Guardado', 'Tu entrada se actualizó correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudo guardar',
        error instanceof Error ? error.message : 'Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (): void => {
    Alert.alert('Confirmar', `¿Quieres quitar "${item.title}" de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFromList(item.id);
            navigation.goBack();
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar entrada</Text>
      <Text style={styles.heading}>{item.title}</Text>

      <Text style={styles.label}>Estado</Text>
      <View style={styles.statusRow}>
        {(['por_ver', 'viendo', 'vista'] as WatchStatus[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.statusOption, estado === option && styles.statusOptionSelected]}
            onPress={() => setEstado(option)}
          >
            <Text style={[styles.statusOptionText, estado === option && styles.statusOptionTextSelected]}>
              {option === 'por_ver' ? 'Por ver' : option === 'viendo' ? 'Viendo' : 'Vista'}
            </Text>
          </Pressable>
        ))}
      </View>

      {estado === 'vista' ? (
        <>
          <Text style={styles.label}>Calificación</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                style={[styles.ratingButton, calificacion === value && styles.ratingButtonSelected]}
                onPress={() => setCalificacion(value)}
              >
                <Text style={[styles.ratingButtonText, calificacion === value && styles.ratingButtonTextSelected]}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.label}>Comentario</Text>
      <TextInput
        value={comentario}
        onChangeText={setComentario}
        multiline
        maxLength={500}
        style={styles.commentInput}
        placeholder="Escribe una reseña breve"
      />
      <Text style={styles.commentCounter}>{comentario.length}/500</Text>

      <Pressable style={styles.saveButton} onPress={() => void handleSave()} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleRemove}>
        <Text style={styles.deleteButtonText}>Quitar de Mi lista</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heading: {
    color: colors.muted,
    fontSize: 18,
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statusOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: colors.olive,
  },
  statusOptionText: {
    color: colors.muted,
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: '#fff',
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingButtonSelected: {
    backgroundColor: colors.accent,
  },
  ratingButtonText: {
    color: colors.muted,
    fontWeight: '700',
  },
  ratingButtonTextSelected: {
    color: colors.textDark,
  },
  commentInput: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    minHeight: 120,
    padding: 12,
    textAlignVertical: 'top',
  },
  commentCounter: {
    color: colors.muted,
    textAlign: 'right',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  saveButtonText: {
    color: colors.textDark,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: colors.paper,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
