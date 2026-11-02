// Quem escreveu a mensagem: o Assistente de IA, o Tutor (quem usa o app) ou o Host
export type ChatAuthor = 'assistant' | 'tutor' | 'host';

export type ChatMessage = {
  id: string;
  author: ChatAuthor;
  // Rótulo do dia que separa as mensagens ("Ontem", "Hoje")
  day: string;
  // 09:20
  time: string;
  text: string;
  imageUri?: string;
  // Respostas rápidas que o Tutor pode tocar para enviar
  suggestions?: string[];
};

// PROVISÓRIO: conversa de exemplo até existirem as rotas de conversa (#209, #219 e #220).
// Nenhuma mensagem traz telefone ou e-mail do Host (decisão de 25/10/2026)
export const SAMPLE_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    author: 'assistant',
    day: 'Ontem',
    time: '10:02',
    text: 'Olá! Sou o Assistente da Hospetse. Posso tirar dúvidas sobre a rotina, o espaço e os cuidados desta hospedagem.',
  },
  {
    id: 'msg-2',
    author: 'tutor',
    day: 'Ontem',
    time: '10:05',
    text: 'O espaço tem área coberta para os dias de chuva?',
  },
  {
    id: 'msg-3',
    author: 'assistant',
    day: 'Ontem',
    time: '10:05',
    text: 'Tem sim! Há uma área coberta com caminhas e brinquedos. Veja uma foto:',
    imageUri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  },
  {
    id: 'msg-4',
    author: 'tutor',
    day: 'Hoje',
    time: '09:12',
    text: 'Meu pet toma remédio duas vezes por dia. Tudo bem?',
  },
  {
    id: 'msg-5',
    author: 'host',
    day: 'Hoje',
    time: '09:20',
    text: 'Oi! Sem problema. É só mandar a receita e os horários, que a gente cuida de tudo.',
  },
  {
    id: 'msg-6',
    author: 'assistant',
    day: 'Hoje',
    time: '09:21',
    text: 'Posso ajudar com mais alguma coisa?',
    suggestions: ['Quais vacinas são exigidas?', 'Posso levar a ração?', 'Como é o check-in?'],
  },
];
