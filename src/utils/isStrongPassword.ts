// Minimo 8 caracteres, maiuscula e minuscula, e um numero ou simbolo
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z]/.test(password)
  );
}
