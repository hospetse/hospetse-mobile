// Traduz os erros por campo do back-end (details do VALIDATION_ERROR) para os campos da tela

// Campo do back-end -> campo da tela
const UI_FIELD: Record<string, string> = {
  description: 'description',
  capacity: 'capacity',
  acceptedSpecies: 'acceptedSpecies',
  acceptedSizes: 'acceptedSizes',
  photos: 'coverPhoto',
  cpfCnpj: 'cpfCnpj',
  address: 'zipCode',
  'address.zipCode': 'zipCode',
  'address.street': 'street',
  'address.number': 'number',
  'address.complement': 'complement',
  'address.neighborhood': 'neighborhood',
  // Cidade e UF vêm do CEP: a correção é buscar o CEP de novo
  'address.city': 'zipCode',
  'address.state': 'zipCode',
  'documents.identity': 'identity',
  'documents.proof_of_address': 'proof_of_address',
  'documents.cnpj_card': 'cnpj_card',
};

const MESSAGE: Record<string, string> = {
  description: 'Confira a apresentação do cuidador.',
  capacity: 'Informe uma capacidade de 1 a 1000 pets.',
  acceptedSpecies: 'Escolha ao menos uma espécie.',
  acceptedSizes: 'Escolha ao menos um porte.',
  coverPhoto: 'Envie ao menos uma foto do espaço.',
  cpfCnpj: 'Confira o CPF ou CNPJ.',
  zipCode: 'Confira o CEP e busque o endereço de novo.',
  street: 'Confira a rua ou o logradouro.',
  number: 'Confira o número.',
  complement: 'Confira o complemento.',
  neighborhood: 'Confira o bairro.',
  identity: 'Envie o documento de identidade.',
  proof_of_address: 'Envie o comprovante de endereço.',
  cnpj_card: 'Envie o cartão CNPJ.',
};

// Campos da etapa 1. Os outros são da etapa 2
const SPACE_FIELDS = ['description', 'capacity', 'acceptedSpecies', 'acceptedSizes'];

export type ServerDetail = { field: string; message: string };

// Um erro por campo da tela. Campos que a tela não mostra (name, providerType) ficam de fora
export function toFieldErrors(details: ServerDetail[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const detail of details) {
    const field = UI_FIELD[detail.field];
    if (!field || errors[field]) {
      continue;
    }
    if (field === 'cpfCnpj' && detail.message.includes('já cadastrado')) {
      errors[field] = 'Esse CPF ou CNPJ já está cadastrado.';
    } else if (field === 'cpfCnpj' && detail.message === 'obrigatório') {
      errors[field] = 'Informe seu CPF ou CNPJ.';
    } else {
      errors[field] = MESSAGE[field];
    }
  }
  return errors;
}

// Em qual etapa o Host precisa corrigir: a 1 se algum erro for dela, senão a 2
export function stepOfErrors(errors: Record<string, string>): 1 | 2 {
  return Object.keys(errors).some((field) => SPACE_FIELDS.includes(field)) ? 1 : 2;
}
