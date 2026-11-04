import { getPasswordRules } from '../src/utils/isStrongPassword';
import {
  hasErrors,
  isValidEmail,
  SignupFormValues,
  validateSignup,
} from '../src/utils/validateSignup';

function buildValues(changes: Partial<SignupFormValues> = {}): SignupFormValues {
  return {
    name: 'Ana Souza',
    email: 'ana@exemplo.com',
    password: 'Senha@123',
    passwordConfirmation: 'Senha@123',
    acceptedTerms: true,
    ...changes,
  };
}

describe('validateSignup', () => {
  test('dados válidos não têm erro', () => {
    const errors = validateSignup(buildValues());

    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  test('retorna o estado de cada regra da senha', () => {
    expect(getPasswordRules('Senha@123')).toEqual({
      minLength: true,
      lowercase: true,
      uppercase: true,
      numberOrSymbol: true,
    });
    expect(getPasswordRules('Senha')).toEqual({
      minLength: false,
      lowercase: true,
      uppercase: true,
      numberOrSymbol: false,
    });
  });

  test('formulário vazio devolve todos os erros de uma vez', () => {
    const errors = validateSignup({
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      acceptedTerms: false,
    });

    expect(errors).toEqual({
      name: 'Informe seu nome completo.',
      email: 'Informe seu e-mail.',
      password: 'Crie uma senha.',
      passwordConfirmation: 'Confirme sua senha.',
      acceptedTerms: 'Aceite os Termos de Uso e a Política de Privacidade.',
    });
    expect(hasErrors(errors)).toBe(true);
  });

  test('nome só com espaços conta como vazio', () => {
    expect(validateSignup(buildValues({ name: '   ' })).name).toBe('Informe seu nome completo.');
  });

  test('nome e e-mail acima de 255 caracteres são recusados, como no Auth', () => {
    const longText = 'a'.repeat(256);

    expect(validateSignup(buildValues({ name: longText })).name).toBe(
      'O nome pode ter no máximo 255 caracteres.',
    );
    expect(validateSignup(buildValues({ email: `${longText}@exemplo.com` })).email).toBe(
      'O e-mail pode ter no máximo 255 caracteres.',
    );
  });

  test('e-mail fora do formato mostra erro', () => {
    const invalidEmails = ['ana', 'ana@', 'ana@exemplo', 'ana@exemplo.c', 'ana souza@exemplo.com'];

    for (const email of invalidEmails) {
      expect(validateSignup(buildValues({ email })).email).toBe(
        'Informe um e-mail válido, como nome@email.com.',
      );
    }
  });

  test('aceita e-mail com espaços nas pontas, que o Auth remove', () => {
    expect(isValidEmail('  ana@exemplo.com  ')).toBe(true);
  });

  test('senha fora da política mostra erro', () => {
    const weakPasswords = ['Ab@1', 'senha@123', 'SENHA@123', 'SenhaForte'];

    for (const password of weakPasswords) {
      const errors = validateSignup(buildValues({ password, passwordConfirmation: password }));
      expect(errors.password).toBe('Sua senha não atende aos requisitos abaixo.');
    }
  });

  test('confirmação diferente da senha mostra erro', () => {
    const errors = validateSignup(buildValues({ passwordConfirmation: 'Senha@124' }));

    expect(errors).toEqual({ passwordConfirmation: 'As senhas não são iguais.' });
  });

  test('termos não aceitos mostram erro', () => {
    const errors = validateSignup(buildValues({ acceptedTerms: false }));

    expect(errors).toEqual({
      acceptedTerms: 'Aceite os Termos de Uso e a Política de Privacidade.',
    });
  });
});
