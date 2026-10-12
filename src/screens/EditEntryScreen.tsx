import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { MyListStackParamList } from '../navigation/AppNavigator';
import { WatchStatus } from '../types';

interface EditEntryScreenProps {
  route: RouteProp<MyListStackParamList, 'EditEntry'>;
  navigation: NativeStackNavigationProp<MyListStackParamList, 'EditEntry'>;
}

export function EditEntryScreen({ route, navigation }: EditEntryScreenProps): React.ReactElement {
  const { items, updateEntry, removeFromList } = useAppContext();
  const item = items.find((currentItem) => currentItem.id === route.params.itemId) ?? null;
  const [estado, setEstado] = useState<WatchStatus>('por_ver');
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (!item) {
      return;
    }

    setEstado(item.estado);
    setCalificacion(item.calificacion ?? null);
    setComentario(item.comentario ?? '');
  }, [item]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No se encontró la entrada para editar.</Text>
      </View>
    );
  }

  const handleSave = async (): Promise<void> => {
    const normalizedComment = comentario.slice(0, 500);
    const nextCalificacion = estado === 'vista' ? calificacion : null;

    await updateEntry(item.id, {
      estado,
      calificacion: nextCalificacion,
      comentario: normalizedComment,
    });

    Alert.alert('Guardado', 'Tu entrada se actualizó correctamente.');
    navigation.goBack();
  };

  const handleRemove = (): void => {
    Alert.alert('Confirmar', `¿Quieres quitar "${item.title}" de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          void removeFromList(item.id);
          navigation.goBack();
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

      <Pressable style={styles.saveButton} onPress={() => void handleSave()}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
    backgroundColor: '#111827',
    padding: 16,
  },
  title: {
    color: '#f3f6fb',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heading: {
    color: '#dfe7fb',
    fontSize: 18,
    marginBottom: 12,
  },
  label: {
    color: '#f3f6fb',
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
    backgroundColor: '#1d2940',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: '#5B8DEF',
  },
  statusOptionText: {
    color: '#dfe7fb',
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
    backgroundColor: '#1d2940',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingButtonSelected: {
    backgroundColor: '#f7b733',
  },
  ratingButtonText: {
    color: '#dfe7fb',
    fontWeight: '700',
  },
  ratingButtonTextSelected: {
    color: '#1d2940',
  },
  commentInput: {
    backgroundColor: '#eff4ff',
    borderRadius: 12,
    minHeight: 120,
    padding: 12,
    textAlignVertical: 'top',
  },
  commentCounter: {
    color: '#bfd0f7',
    textAlign: 'right',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#2eb67d',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#d9485f',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#dfe7fb',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
