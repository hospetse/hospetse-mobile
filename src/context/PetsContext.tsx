import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { useSession } from './SessionContext';
import { createPet, deletePet, listMyPets, Pet, PetInput, updatePet } from '../services/pets';

export type PetsContextValue = {
  pets: Pet[];
  loading: boolean;
  error: unknown | null;
  refresh: () => Promise<Pet[]>;
  addPet: (input: PetInput) => Promise<Pet>;
  updatePet: (id: string, input: PetInput) => Promise<Pet>;
  removePet: (id: string) => Promise<void>;
};

const PetsContext = createContext<PetsContextValue | null>(null);

type PetsProviderProps = {
  children: ReactNode;
};

export function PetsProvider({ children }: PetsProviderProps) {
  const { currentUser } = useSession();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setPets([]);
      setError(null);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const result = await listMyPets();
      setPets(result);
      return result;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addPet = useCallback(async (input: PetInput) => {
    const saved = await createPet(input);
    setPets((current) => [...current, saved]);
    return saved;
  }, []);

  const updatePetItem = useCallback(async (id: string, input: PetInput) => {
    const saved = await updatePet(id, input);
    setPets((current) => current.map((pet) => (pet.id === id ? saved : pet)));
    return saved;
  }, []);

  const removePet = useCallback(async (id: string) => {
    await deletePet(id);
    setPets((current) => current.filter((pet) => pet.id !== id));
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setPets([]);
      setError(null);
      return;
    }

    void refresh().catch(() => {
      // A tela que consumir o contexto mostra o estado de erro e oferece nova tentativa.
    });
  }, [currentUser, refresh]);

  return (
    <PetsContext.Provider value={{ pets, loading, error, refresh, addPet, updatePet: updatePetItem, removePet }}>
      {children}
    </PetsContext.Provider>
  );
}

const EMPTY_PETS_CONTEXT: PetsContextValue = {
  pets: [],
  loading: false,
  error: null,
  refresh: async () => [],
  addPet: createPet,
  updatePet: updatePet,
  removePet: async () => {},
};

export function usePets() {
  const context = useContext(PetsContext);
  return context ?? EMPTY_PETS_CONTEXT;
}
