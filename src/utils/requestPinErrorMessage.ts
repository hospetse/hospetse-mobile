// Mensagens das respostas do request-pin (409 é tratado à parte: leva ao login)
export function requestPinErrorMessage(status: number | null): string {
  switch (status) {
    case 400:
      return 'Informe um e-mail válido.';
    case 429:
      return 'Você pediu um código há pouco. Aguarde 1 minuto e tente de novo.';
    case null:
      return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
    default:
      return 'Não foi possível enviar o código. Tente de novo.';
  }
}
