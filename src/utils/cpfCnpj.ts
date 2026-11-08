import { onlyDigits } from './formatZipCode';

// Máscara enquanto digita: até 11 dígitos é CPF (000.000.000-00), de 12 a 14 é CNPJ (00.000.000/0000-00)
export function formatCpfCnpj(text: string): string {
  const digits = onlyDigits(text).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function allSameDigit(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

// Dígito verificador: soma ponderada dos dígitos, resto da divisão por 11
function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isValidCpf(text: string): boolean {
  const digits = onlyDigits(text);
  if (digits.length !== 11 || allSameDigit(digits)) {
    return false;
  }
  const first = checkDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(digits[9]) && second === Number(digits[10]);
}

export function isValidCnpj(text: string): boolean {
  const digits = onlyDigits(text);
  if (digits.length !== 14 || allSameDigit(digits)) {
    return false;
  }
  const first = checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(digits[12]) && second === Number(digits[13]);
}
