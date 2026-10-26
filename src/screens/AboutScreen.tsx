import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { colors } from '../theme';

export function AboutScreen(): React.ReactElement {
  const { signOutUser } = useAppContext();

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOutUser();
    } catch (error) {
      Alert.alert(
        'No se pudo cerrar la sesión',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Mi Cartelera Personal</Text>
      <Text style={styles.title}>Acerca de</Text>

      <View style={styles.logoBox}>
        <Text style={styles.logoText}>TMDB</Text>
      </View>

      <Text style={styles.bodyText}>
        Esta aplicación utiliza la API de TMDB, pero no está respaldada, avalada ni certificada por TMDB.
      </Text>

      <Text style={styles.bodyText}>
        Mi Cartelera Personal es una aplicación para llevar el control de películas y series que quieres ver,
        estás viendo o ya has visto.
      </Text>

      <Pressable style={styles.button} onPress={() => void handleSignOut()}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  appName: {
    color: colors.accent,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    marginBottom: 8,
  },
  logoBox: {
    width: 104,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#0d253f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#01b4e4',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 19,
  },
  bodyText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  button: {
    backgroundColor: colors.danger,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
