import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { firebaseConfigured } from '../config/env';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme';

function translateFirebaseError(code: string): string {
  const translations: Record<string, string> = {
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/user-disabled': 'La cuenta está deshabilitada.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/invalid-credential': 'El correo o la contraseña son incorrectos.',
    'auth/operation-not-allowed': 'El inicio de sesión por correo y contraseña no está habilitado en Firebase.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/network-request-failed': 'No se pudo conectar a Firebase. Revisa la red.',
  };

  return translations[code] ?? 'Ocurrió un error de autenticación.';
}

export function AuthScreen(): React.ReactElement {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAppContext();

  const handleSubmit = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Completa correo y contraseña para continuar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password.trim());
      } else {
        await signUp(email.trim(), password.trim());
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Error al iniciar sesión';
      const firebaseErrorCode = message.match(/auth\/[a-z-]+/)?.[0];
      const normalized = firebaseErrorCode ? translateFirebaseError(firebaseErrorCode) : message;
      setError(normalized);
      Alert.alert('Error', normalized);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
        <Text style={styles.subtitle}>Mi Cartelera Personal</Text>

        {!firebaseConfigured ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Falta la configuración de Firebase. Completa los valores de .env antes de usar la app.
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}</Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switchText}> {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'} </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.muted,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    minHeight: 48,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: colors.olive,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  switchText: {
    marginTop: 18,
    color: colors.accent,
    textAlign: 'center',
    fontSize: 15,
  },
  errorText: {
    marginBottom: 14,
    color: colors.dangerLight,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#4c4227',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    color: '#f4dda1',
    fontSize: 14,
  },
});
