// PROVISÓRIO: serviços adicionais do protótipo. A API ainda não tem esse campo, então eles ficam na
// tela, mas não somam no total nem vão na solicitação (decisão da desenvolvedora, 2026-11-01)
export type AddOn = {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
};

export const SAMPLE_ADD_ONS: AddOn[] = [
  {
    id: 'shower',
    title: 'Ducha Especial',
    description: 'Seu pet volta limpinho e cheiroso.',
    pricePerDay: 80,
  },
  {
    id: 'extra-walk',
    title: 'Passeio Extra (30min)',
    description: 'Garante que a energia será gasta.',
    pricePerDay: 35,
  },
];
