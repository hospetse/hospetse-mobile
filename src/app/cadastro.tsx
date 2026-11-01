import { router } from 'expo-router';
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
import { InfoIcon } from '../components/InfoIcon';
import { theme } from '../constants/theme';
import { useSignup } from '../context/SignupContext';
import { getErrorStatus, requestPin } from '../services/auth';
import { requestPinErrorMessage, requestPinErrorTitle } from '../utils/requestPinErrorMessage';
import { hasErrors, SignupFormErrors, validateSignup } from '../utils/validateSignup';

type ServerError = {
  title: string;
  message: string;
};

export default function RegisterScreen() {
  const { saveSignup, clearSignup } = useSignup();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [loading, setLoading] = useState(false);

  // Referências dos campos, para levar o foco ao primeiro campo com erro
  const nameRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const passwordConfirmationRef = useRef<TextInputInstance>(null);

  function focusFirstError(formErrors: SignupFormErrors) {
    if (formErrors.name) {
      nameRef.current?.focus();
    } else if (formErrors.email) {
      emailRef.current?.focus();
    } else if (formErrors.password) {
      passwordRef.current?.focus();
    } else if (formErrors.passwordConfirmation) {
      passwordConfirmationRef.current?.focus();
    }
  }

  // Ao corrigir um campo, o erro dele some, e os erros dos outros campos continuam
  function clearError(field: keyof SignupFormErrors) {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  }

  async function handleRegister() {
    // Segunda proteção contra envio duplicado (o botão também fica desabilitado)
    if (loading) {
      return;
    }

    // Confere todos os campos de uma vez, antes de chamar o Auth
    const formErrors = validateSignup({
      name,
      email,
      password,
      passwordConfirmation,
      acceptedTerms,
    });
    setErrors(formErrors);

    if (hasErrors(formErrors)) {
      focusFirstError(formErrors);
      return;
    }

    setLoading(true);

    try {
      const challengeId = await requestPin(email);
      // Dados guardados só em memória até a tela do código. A confirmação da senha não vai junto
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

      if (status === 400) {
        // O servidor recusou o e-mail: o erro aparece no próprio campo
        setErrors({ email: requestPinErrorMessage(status) });
        emailRef.current?.focus();
        return;
      }

      setServerError({
        title: requestPinErrorTitle(status),
        message: requestPinErrorMessage(status),
      });
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
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Cadastro do Tutor
          </Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para conectar{'\n'}seus pets aos melhores cuidadores da Hospetse
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Informe seu nome completo</Text>
          <TextInput
            accessibilityHint={errors.name}
            accessibilityLabel="Nome completo"
            autoCapitalize="words"
            autoComplete="name"
            maxLength={255}
            onChangeText={(text) => {
              setName(text);
              clearError('name');
            }}
            onSubmitEditing={() => emailRef.current?.focus()}
            placeholder="João da Silva"
            placeholderTextColor={theme.colors.placeholder}
            ref={nameRef}
            returnKeyType="next"
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={name}
          />
          <FieldError message={errors.name} />

          <Text style={styles.labelSpaced}>Informe seu e-mail</Text>
          <TextInput
            accessibilityHint={errors.email}
            accessibilityLabel="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            maxLength={255}
            onChangeText={(text) => {
              setEmail(text);
              clearError('email');
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

          <Text style={styles.labelSpaced}>Crie uma senha</Text>
          <TextInput
            accessibilityHint={errors.password}
            accessibilityLabel="Senha"
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={(text) => {
              setPassword(text);
              clearError('password');
            }}
            onSubmitEditing={() => passwordConfirmationRef.current?.focus()}
            ref={passwordRef}
            returnKeyType="next"
            secureTextEntry
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={password}
          />
          <FieldError message={errors.password} />

          <View style={styles.rulesTitleRow}>
            <InfoIcon />
            <Text style={styles.rulesTitle}>Sua senha deve conter:</Text>
          </View>
          <Text style={styles.rule}>1. No mínimo 8 caracteres</Text>
          <Text style={styles.rule}>2. Letras maiúsculas e minúsculas</Text>
          <Text style={styles.rule}>3. Pelo menos um número ou símbolo</Text>

          <Text style={styles.labelSpaced}>Confirme sua senha</Text>
          <TextInput
            accessibilityHint={errors.passwordConfirmation}
            accessibilityLabel="Confirmar senha"
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={(text) => {
              setPasswordConfirmation(text);
              clearError('passwordConfirmation');
            }}
            onSubmitEditing={handleRegister}
            ref={passwordConfirmationRef}
            returnKeyType="done"
            secureTextEntry
            style={[styles.input, errors.passwordConfirmation ? styles.inputError : null]}
            value={passwordConfirmation}
          />
          <FieldError message={errors.passwordConfirmation} />

          <View style={styles.termsRow}>
            <TouchableOpacity
              accessibilityHint={errors.acceptedTerms}
              accessibilityLabel="Concordar com os termos"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              hitSlop={theme.spacing.medium}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                clearError('acceptedTerms');
              }}
              style={[
                styles.checkbox,
                acceptedTerms ? styles.checkboxChecked : null,
                errors.acceptedTerms ? styles.checkboxError : null,
              ]}
            />
            <Text style={styles.termsText}>
              Concordo com os <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>
          </View>
          <FieldError message={errors.acceptedTerms} />

          <Button loading={loading} onPress={handleRegister} title="Criar conta" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui conta? </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              clearSignup();
              router.replace('/');
            }}
          >
            <Text style={styles.link}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ErrorModal
        message={serverError ? serverError.message : ''}
        onClose={() => setServerError(null)}
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
  checkboxError: {
    borderColor: theme.colors.error,
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
