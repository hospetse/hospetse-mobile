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
import { theme } from '../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  function handleLogin() {
    if (!email.trim() || !password) {
      setError('Informe seu e-mail e sua senha para continuar.');
      return;
    }

    setError('');
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Olá, seja bem vindo!</Text>
          <Text style={styles.subtitle}>Acesse para cuidar do seu pet!</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Informe seu e-mail</Text>
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

          <Text style={styles.passwordLabel}>Digite sua senha</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="**********"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!passwordVisible}
              style={styles.passwordInput}
              value={password}
            />
            <TouchableOpacity
              accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.passwordToggle}
            >
              <Text style={styles.passwordToggleText}>{passwordVisible ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/recuperar-senha')} style={styles.forgotButton}>
            <Text style={styles.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <Button onPress={handleLogin} title="Entrar" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={styles.link}>Cadastre-se</Text>
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
    paddingTop: 120,
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
  },
  form: {
    marginTop: theme.spacing.section,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.label,
    marginBottom: theme.spacing.small,
  },
  passwordLabel: {
    color: theme.colors.text,
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
  passwordInputContainer: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.input,
    flexDirection: 'row',
    minHeight: 48,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  passwordInput: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    paddingHorizontal: theme.spacing.input,
  },
  passwordToggle: {
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.input,
  },
  passwordToggleText: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.small,
  },
  link: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  formError: {
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.medium,
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
