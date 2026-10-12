import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppContext } from '../context/AppContext';

export function AboutScreen(): React.ReactElement {
  const { signOutUser } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acerca de</Text>

      <View style={styles.logoBox}>
        <Text style={styles.logoText}>TMDB</Text>
      </View>

      <Text style={styles.bodyText}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
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
    backgroundColor: '#111827',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#f3f6fb',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  logoBox: {
    width: 180,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 28,
  },
  bodyText: {
    color: '#dfe7fb',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#d9485f',
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
