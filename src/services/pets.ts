import { backendApi } from './api';

// Um pet do Tutor, no formato do GET /api/v1/me/pets do back-end (#369). A API ainda não tem foto
export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  size: string | null;
};

// O back-end aceita até 50 por página; um Tutor com mais pets que isso fica para a paginação
const PAGE_SIZE = 50;

// Pets ativos do Tutor logado
export async function listMyPets(): Promise<Pet[]> {
  const { data } = await backendApi.get<{ items: Pet[] }>('/api/v1/me/pets', {
    params: { page: 1, pageSize: PAGE_SIZE },
  });
  return data.items;
}
