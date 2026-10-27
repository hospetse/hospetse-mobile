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
import { useSignup } from '../context/SignupContext';
import { getErrorStatus, requestPin } from '../services/auth';
import { isStrongPassword } from '../utils/isStrongPassword';
import { requestPinErrorMessage } from '../utils/requestPinErrorMessage';

export default function RegisterScreen() {
  const { saveSignup, clearSignup } = useSignup();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha todos os campos para continuar.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Sua senha não atende aos requisitos.');
      return;
    }

    if (!acceptedTerms) {
      setError('Aceite os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const challengeId = await requestPin(email);
      saveSignup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        acceptedTerms,
        challengeId,
        pinRequestedAt: Date.now(),
      });
      router.push('/codigo');
    } catch (requestError) {
      const status = getErrorStatus(requestError);
      if (status === 409) {
        clearSignup();
        router.replace({ pathname: '/', params: { aviso: 'email-cadastrado' } });
        return;
      }
      setError(requestPinErrorMessage(status));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro do Tutor</Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para conectar{'\n'}seus pets aos melhores cuidadores da Hospetse
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Informe seu nome completo</Text>
          <TextInput
            autoCapitalize="words"
            autoComplete="name"
            onChangeText={setName}
            placeholder="João da Silva"
            placeholderTextColor={theme.colors.placeholder}
            style={styles.input}
            value={name}
          />

          <Text style={styles.labelSpaced}>Informe seu e-mail</Text>
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

          <Text style={styles.labelSpaced}>Crie uma senha</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <View style={styles.rulesTitleRow}>
            <InfoIcon />
            <Text style={styles.rulesTitle}>Sua senha deve conter:</Text>
          </View>
          <Text style={styles.rule}>1. No mínimo 8 caracteres</Text>
          <Text style={styles.rule}>2. Letras maiúsculas e minúsculas</Text>
          <Text style={styles.rule}>3. Pelo menos um número ou símbolo</Text>

          <View style={styles.termsRow}>
            <TouchableOpacity
              accessibilityLabel="Concordar com os termos"
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
            />
            <Text style={styles.termsText}>
              Concordo com os <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <Button loading={loading} onPress={handleRegister} title="Criar conta" />
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
    paddingTop: 80,
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
  labelSpaced: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.label,
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.large,
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
  rulesTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.large,
  },
  rulesTitle: {
    color: theme.colors.button,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
  },
  rule: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.label,
    marginLeft: theme.spacing.page,
    marginTop: theme.spacing.small,
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.section,
  },
  checkbox: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.checkbox,
    borderWidth: 1,
    height: theme.spacing.checkbox,
    marginRight: theme.spacing.small,
    width: theme.spacing.checkbox,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.button,
  },
  termsText: {
    color: theme.colors.placeholder,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.label,
  },
  termsLink: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
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
