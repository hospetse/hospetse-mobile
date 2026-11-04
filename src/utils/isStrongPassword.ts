export type PasswordRules = {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  numberOrSymbol: boolean;
};

export function getPasswordRules(password: string): PasswordRules {
  return {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numberOrSymbol: /[^A-Za-z]/.test(password),
  };
}

export function isStrongPassword(password: string): boolean {
  return Object.values(getPasswordRules(password)).every(Boolean);
}
