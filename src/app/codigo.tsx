import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { TERMS_VERSION } from '../constants/terms';
import { theme } from '../constants/theme';
import { useSignup } from '../context/SignupContext';
import { getErrorStatus, register } from '../services/auth';
import { saveTokens } from '../services/token-storage';

const CODE_LENGTH = 6;

// Mensagens das respostas do register (409 é tratado à parte: leva ao login)
function registerErrorMessage(status: number | null): string {
  switch (status) {
    case 401:
      return 'Código inválido. Confira e digite de novo.';
    case 404:
    case 410:
      return 'Este código expirou. Peça um novo código.';
    case 429:
      return 'Muitas tentativas. Peça um novo código.';
    case 400:
      return 'Alguns dados do cadastro estão inválidos. Volte e confira.';
    case null:
      return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
    default:
      return 'Não foi possível concluir o cadastro. Tente de novo.';
  }
}

export default function CodeScreen() {
  const { signup, clearSignup } = useSignup();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sem os dados do cadastro em memória não há como concluir: volta ao início do fluxo
  if (!signup) {
    return <Redirect href="/cadastro" />;
  }

  async function handleConfirm() {
    if (!signup) {
      return;
    }

    if (code.replace(/\s/g, '').length < CODE_LENGTH) {
      setError('Digite os 6 números do código enviado ao seu e-mail.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const tokens = await register({
        challengeId: signup.challengeId,
        pin: code,
        name: signup.name,
        password: signup.password,
        acceptedTerms: signup.acceptedTerms,
        termsVersion: TERMS_VERSION,
      });
      await saveTokens(tokens);
      const firstName = signup.name.split(' ')[0];
      // Conta criada: a senha sai da memória e o voltar não retorna ao PIN
      clearSignup();
      router.replace({ pathname: '/home', params: { nome: firstName } });
    } catch (registerError) {
      const status = getErrorStatus(registerError);
      if (status === 409) {
        clearSignup();
        router.replace({ pathname: '/', params: { aviso: 'email-cadastrado' } });
        return;
      }
      // O código digitado continua na tela para tentar de novo
      setError(registerErrorMessage(status));
    } finally {
      setLoading(false);
    }
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

          <Button loading={loading} onPress={handleConfirm} title="Criar conta" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui conta? </Text>
          <TouchableOpacity
            onPress={() => {
              clearSignup();
              router.replace('/');
            }}
          >
            <Text style={styles.link}>Entrar</Text>
          </TouchableOpacity>
        </View>

        {/* TEMPORÁRIO: atalho de desenvolvimento enquanto a rota interna do back-end (#261) não existe. Remover antes do PR */}
        {__DEV__ ? (
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/home', params: { nome: signup.name.split(' ')[0] } })
            }
            style={styles.footer}
          >
            <Text style={styles.link}>Abrir Home (temporário)</Text>
          </TouchableOpacity>
        ) : null}
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
