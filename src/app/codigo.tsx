import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { TERMS_VERSION } from '../constants/terms';
import { theme } from '../constants/theme';
import { useSignup } from '../context/SignupContext';
import { getErrorStatus, isRequestError, register, requestPin } from '../services/auth';
import { saveTokens } from '../services/token-storage';
import { requestPinErrorMessage } from '../utils/requestPinErrorMessage';

const CODE_LENGTH = 6;

// Intervalo mínimo do Auth entre dois pedidos de PIN
const RESEND_INTERVAL_MS = 60 * 1000;

function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// Mensagens das respostas do register (409 é tratado à parte: leva ao login)
function registerErrorMessage(status: number | null): string {
  switch (status) {
    case 401:
      return 'Código inválido. Confira e digite de novo.';
    case 404:
    case 410:
      return 'Este código expirou. Toque em Reenviar código.';
    case 429:
      return 'Muitas tentativas. Toque em Reenviar código.';
    case 400:
      return 'Alguns dados do cadastro estão inválidos. Volte e confira.';
    case null:
      return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
    default:
      return 'Não foi possível concluir o cadastro. Tente de novo.';
  }
}

export default function CodeScreen() {
  const { signup, saveSignup, clearSignup } = useSignup();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Atualiza o contador do reenvio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sem os dados do cadastro em memória não há como concluir: volta ao início do fluxo
  if (!signup) {
    return <Redirect href="/cadastro" />;
  }

  // Calculado pela hora do pedido, então continua certo se o app for para segundo plano
  const secondsToResend = Math.max(
    0,
    Math.ceil((signup.pinRequestedAt + RESEND_INTERVAL_MS - now) / 1000),
  );

  async function handleResend() {
    if (!signup || secondsToResend > 0 || resending) {
      return;
    }

    setError('');
    setInfo('');
    setResending(true);

    try {
      const challengeId = await requestPin(signup.email);
      // O PIN anterior foi invalidado: troca o challengeId e reinicia o contador
      saveSignup({ ...signup, challengeId, pinRequestedAt: Date.now() });
      setNow(Date.now());
      setCode('');
      setInfo('Enviamos um novo código para seu e-mail.');
    } catch (resendError) {
      const status = getErrorStatus(resendError);
      if (status === 409) {
        clearSignup();
        router.replace({ pathname: '/', params: { aviso: 'email-cadastrado' } });
        return;
      }
      setError(requestPinErrorMessage(status));
    } finally {
      setResending(false);
    }
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
    setInfo('');
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
      // A conta foi criada, mas o aparelho não guardou os tokens (ex.: na web, sem SecureStore).
      // Não é falta de conexão: leva ao login, que já funciona com a conta nova
      if (!isRequestError(registerError)) {
        clearSignup();
        router.replace({ pathname: '/', params: { aviso: 'conta-criada' } });
        return;
      }

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
          {info ? <Text style={styles.formInfo}>{info}</Text> : null}

          <Button loading={loading} onPress={handleConfirm} title="Criar conta" />

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: secondsToResend > 0 || resending }}
            disabled={secondsToResend > 0 || resending}
            onPress={handleResend}
            style={styles.resend}
          >
            {secondsToResend > 0 ? (
              <Text style={styles.resendDisabled}>
                Reenviar código em {formatCountdown(secondsToResend)}
              </Text>
            ) : (
              <Text style={styles.link}>{resending ? 'Reenviando...' : 'Reenviar código'}</Text>
            )}
          </TouchableOpacity>
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

        {/* TEMPORÁRIO: atalho de desenvolvimento enquanto a rota interna do back-end (#261) não existe. Remover quando a #261 for integrada */}
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
  formInfo: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.medium,
  },
  resend: {
    alignItems: 'center',
    marginTop: theme.spacing.section,
  },
  resendDisabled: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
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
