import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { ErrorModal } from '../components/ErrorModal';
import { FieldError } from '../components/FieldError';
import { theme } from '../constants/theme';
import { getErrorStatus, login } from '../services/auth';
import { saveTokens } from '../services/token-storage';
import { LoginFormErrors, validateLogin } from '../utils/validateLogin';

type ServerError = {
  title: string;
  message: string;
  buttonTitle: string;
  // Quando o cadastro não foi concluído, o botão do aviso leva de volta ao cadastro
  goToSignup: boolean;
};

// Avisos das respostas do login. Os textos do 401 são os do design
function loginServerError(status: number | null): ServerError {
  switch (status) {
    case 401:
      return {
        title: 'Login ou senha incorretos',
        message: 'Verifique seu e-mail e senha e tente novamente.',
        buttonTitle: 'Voltar',
        goToSignup: false,
      };
    case 403:
      return {
        title: 'Cadastro não concluído',
        message: 'Seu cadastro ainda não foi finalizado. Cadastre-se de novo para receber um novo código.',
        buttonTitle: 'Concluir cadastro',
        goToSignup: true,
      };
    case null:
      return {
        title: 'Sem conexão',
        message: 'Não foi possível conectar. Verifique sua internet e tente de novo.',
        buttonTitle: 'Voltar',
        goToSignup: false,
      };
    default:
      return {
        title: 'Algo deu errado',
        message: 'Não foi possível entrar. Tente de novo.',
        buttonTitle: 'Voltar',
        goToSignup: false,
      };
  }
}

export default function LoginScreen() {
  // Vem do cadastro quando o e-mail já tem conta (409)
  const { aviso } = useLocalSearchParams<{ aviso?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const notice =
    aviso === 'email-cadastrado' ? 'Este e-mail já tem conta. Entre com sua senha.' : '';

  async function handleLogin() {
    // Segunda proteção contra envio duplicado (o botão também fica desabilitado)
    if (loading) {
      return;
    }

    // Confere os dois campos de uma vez e mostra os dois erros juntos
    const formErrors = validateLogin(email, password);
    setErrors(formErrors);

    if (formErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (formErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const tokens = await login(email, password);
      // Tokens no Keychain/Keystore; a senha não é guardada em lugar nenhum
      await saveTokens(tokens);
      router.replace('/home');
    } catch (loginError) {
      const status = getErrorStatus(loginError);

      if (status === 400) {
        // O servidor recusou o formato: o erro aparece no campo de e-mail
        setErrors({ email: 'Informe um e-mail válido.' });
        emailRef.current?.focus();
        return;
      }

      setServerError(loginServerError(status));
    } finally {
      setLoading(false);
    }
  }

  function handleCloseServerError() {
    const goToSignup = serverError ? serverError.goToSignup : false;
    setServerError(null);

    if (goToSignup) {
      router.push('/cadastro');
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Olá, seja bem vindo!
          </Text>
          <Text style={styles.subtitle}>Acesse para cuidar do seu pet!</Text>
        </View>

        <View style={styles.form}>
          {notice ? (
            <Text accessibilityLiveRegion="polite" style={styles.notice}>
              {notice}
            </Text>
          ) : null}

          <Text style={styles.label}>Informe seu e-mail</Text>
          <TextInput
            accessibilityHint={errors.email}
            accessibilityLabel="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            maxLength={255}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="exemplo@email.com"
            placeholderTextColor={theme.colors.placeholder}
            ref={emailRef}
            returnKeyType="next"
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
          />
          <FieldError message={errors.email} />

          <Text style={styles.passwordLabel}>Digite sua senha</Text>
          <View
            style={[styles.passwordInputContainer, errors.password ? styles.inputError : null]}
          >
            <TextInput
              accessibilityHint={errors.password}
              accessibilityLabel="Senha"
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              onSubmitEditing={handleLogin}
              placeholder="**********"
              placeholderTextColor={theme.colors.placeholder}
              ref={passwordRef}
              returnKeyType="done"
              secureTextEntry={!passwordVisible}
              style={styles.passwordInput}
              value={password}
            />
            <TouchableOpacity
              accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
              accessibilityRole="button"
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.passwordToggle}
            >
              <Text style={styles.passwordToggleText}>{passwordVisible ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
          <FieldError message={errors.password} />

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/recuperar-senha')}
            style={styles.forgotButton}
          >
            <Text style={styles.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <Button loading={loading} onPress={handleLogin} title="Entrar" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/cadastro')}>
            <Text style={styles.link}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ErrorModal
        buttonTitle={serverError ? serverError.buttonTitle : 'Voltar'}
        message={serverError ? serverError.message : ''}
        onClose={handleCloseServerError}
        title={serverError ? serverError.title : ''}
        visible={serverError !== null}
      />
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
  notice: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
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
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
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
  inputError: {
    borderColor: theme.colors.error,
  },
  passwordInputContainer: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
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
