// Deixa só os dígitos do texto
export function onlyDigits(text: string): string {
  return text.replace(/\D/g, '');
}

// Máscara do CEP enquanto o usuário digita: 04538132 vira 04538-132 (no máximo 8 dígitos)
export function formatZipCode(text: string): string {
  const digits = onlyDigits(text).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
