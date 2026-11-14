import type { PetSize } from '../constants/search';
import type { PetSpecies } from '../constants/pets';
import { backendApi } from './api';

// Um pet do Tutor, no formato do GET /api/v1/me/pets do back-end (#369).
export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  size: PetSize | null;
  birthDate?: string | null;
  medicalNotes?: string | null;
  behavioralNotes?: string | null;
};

export type PetInput = {
  name: string;
  species: PetSpecies;
  breed?: string;
  size?: PetSize;
  birthDate?: string;
  medicalNotes?: string;
  behavioralNotes?: string;
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

// Cria um pet para o Tutor do token. O tutorId nunca é enviado pelo app.
export async function createPet(input: PetInput): Promise<Pet> {
  const { data } = await backendApi.post<Pet>('/api/v1/me/pets', input);
  return data;
}

export async function updatePet(id: string, input: PetInput): Promise<Pet> {
  const { data } = await backendApi.put<Pet>(`/api/v1/me/pets/${id}`, input);
  return data;
}

export async function deletePet(id: string): Promise<void> {
  await backendApi.delete(`/api/v1/me/pets/${id}`);
}
