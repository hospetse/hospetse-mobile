import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { InfoIcon } from '../components/InfoIcon';
import { theme } from '../constants/theme';

export default function RecoverPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSend() {
    if (!email.trim().includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }

    setError('');
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            Digite seu e-mail cadastrado para{'\n'}enviarmos as instruções de redefinição
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail cadastrado</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="exemplo@email.com"
            placeholderTextColor={theme.colors.placeholder}
            style={styles.input}
            value={email}
          />

          <View style={styles.infoRow}>
            <InfoIcon />
            <Text style={styles.infoText}>
              Você receberá um link com código de verificação para criar uma nova senha com
              segurança
            </Text>
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <Button onPress={handleSend} title="Enviar instruções" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Lembrou sua senha? </Text>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.link}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.page,
    paddingTop: 140,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.extraBold,
    fontSize: theme.typography.title,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  form: {
    marginTop: theme.spacing.section,
  },
  label: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.label,
    marginBottom: theme.spacing.small,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.input,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    minHeight: 48,
    paddingHorizontal: theme.spacing.input,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.large,
  },
  infoText: {
    color: theme.colors.subtitle,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  formError: {
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.medium,
  },
  link: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.section,
  },
  footerText: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
});
