import { isStrongPassword } from './isStrongPassword';

// Mesmo limite do Auth Server (Joi .max(255)) para nome e e-mail
export const MAX_FIELD_LENGTH = 255;

export type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptedTerms: boolean;
};

// Cada campo com problema recebe a sua mensagem. Campo sem erro fica de fora
export type SignupFormErrors = {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  acceptedTerms?: string;
};

// Algo antes do @, um domínio, um ponto e pelo menos 2 letras no final (ex.: nome@email.com)
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_FORMAT.test(email.trim());
}

// Confere todos os campos de uma vez, para a tela mostrar todos os erros juntos.
// Espelha a validação do Auth Server, mas não substitui: o servidor valida de novo
export function validateSignup(values: SignupFormValues): SignupFormErrors {
  const errors: SignupFormErrors = {};

  const name = values.name.trim();
  if (name === '') {
    errors.name = 'Informe seu nome completo.';
  } else if (name.length > MAX_FIELD_LENGTH) {
    errors.name = 'O nome pode ter no máximo 255 caracteres.';
  }

  const email = values.email.trim();
  if (email === '') {
    errors.email = 'Informe seu e-mail.';
  } else if (email.length > MAX_FIELD_LENGTH) {
    errors.email = 'O e-mail pode ter no máximo 255 caracteres.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Informe um e-mail válido, como nome@email.com.';
  }

  if (values.password === '') {
    errors.password = 'Crie uma senha.';
  } else if (!isStrongPassword(values.password)) {
    errors.password = 'Sua senha não atende aos requisitos abaixo.';
  }

  if (values.passwordConfirmation === '') {
    errors.passwordConfirmation = 'Confirme sua senha.';
  } else if (values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = 'As senhas não são iguais.';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Aceite os Termos de Uso e a Política de Privacidade.';
  }

  return errors;
}

export function hasErrors(errors: SignupFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
