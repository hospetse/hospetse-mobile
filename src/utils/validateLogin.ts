import { isValidEmail } from './validateSignup';

export type LoginFormErrors = {
  email?: string;
  password?: string;
};

// Confere os dois campos de uma vez, antes de chamar o Auth.
// A senha não passa pela política aqui: quem errou a senha recebe o 401 do servidor
export function validateLogin(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (email.trim() === '') {
    errors.email = 'Informe seu e-mail.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Informe um e-mail válido, como nome@email.com.';
  }

  if (password === '') {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}
