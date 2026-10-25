import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { colors } from '../theme';

export function AboutScreen(): React.ReactElement {
  const { signOutUser } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acerca de</Text>

      <View style={styles.logoBox}>
        <Text style={styles.logoText}>TMDB</Text>
      </View>

      <Text style={styles.bodyText}>
        Esta aplicación utiliza la API de TMDB, pero no está respaldada ni certificada por TMDB.
      </Text>

      <Text style={styles.bodyText}>
        Mi Cartelera Personal es una aplicación para llevar el control de películas y series que quieres ver,
        estás viendo o ya has visto.
      </Text>

      <Pressable style={styles.button} onPress={() => void signOutUser()}>
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
  logoBox: {
    width: 180,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.oliveDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 28,
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
