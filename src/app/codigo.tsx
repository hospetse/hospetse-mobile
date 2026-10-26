import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { theme } from '../constants/theme';

const CODE_LENGTH = 6;

export default function CodeScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleConfirm() {
    if (code.replace(/\s/g, '').length < CODE_LENGTH) {
      setError('Digite os 6 números do código enviado ao seu e-mail.');
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
        <Text style={styles.title}>Digite o código enviado{'\n'}ao seu e-mail</Text>

        <View style={styles.form}>
          <CodeInput length={CODE_LENGTH} onChange={setCode} value={code} />

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <Button onPress={handleConfirm} title="Criar conta" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui conta? </Text>
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
    padding: theme.spacing.page,
    paddingTop: 140,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.extraBold,
    fontSize: theme.typography.title,
    lineHeight: 36,
    textAlign: 'center',
  },
  form: {
    marginTop: theme.spacing.page * 2,
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
