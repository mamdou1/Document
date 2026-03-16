// hooks/useEntitees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEntiteeUn,
  createEntiteeUn,
  updateEntiteeUnById,
  deleteEntiteeUnById,
  getFunctionsByEntiteeUn,
} from "../api/entiteeUn";
import {
  createEntiteeDeux,
  getAllEntiteeDeux,
  getEntiteeDeuxByEntiteeUn,
  getFunctionsByEntiteeDeux,
  updateEntiteeDeuxById,
  deleteEntiteeDeuxById,
} from "../api/entiteeDeux";
import {
  getAllEntiteeTrois,
  createEntiteeTrois,
  updateEntiteeTroisById,
  deleteEntiteeTroisById,
  getFunctionsByEntiteeTrois,
  getEntiteeTroisTitre,
  updateEntiteeTroisTitre,
} from "../api/entiteeTrois";
import { getEntiteeTroisByEntiteeDeux } from "../api/entiteeTrois";
import { deleteFonctionById } from "../api/fonction";
import type {
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Fonction,
} from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const entiteeUnKeys = {
  all: ["entiteeUn"] as const,
  lists: () => [...entiteeUnKeys.all, "list"] as const,
  details: (id: number) => [...entiteeUnKeys.all, "details", id] as const,
  fonctions: (id: number) => [...entiteeUnKeys.all, "fonctions", id] as const,
};

export const entiteeDeuxKeys = {
  all: ["entiteeDeux"] as const,
  lists: () => [...entiteeDeuxKeys.all, "list"] as const,
  byParent: (parentId: number) =>
    [...entiteeDeuxKeys.all, "byParent", parentId] as const,
  details: (id: number) => [...entiteeDeuxKeys.all, "details", id] as const,
  fonctions: (id: number) => [...entiteeDeuxKeys.all, "fonctions", id] as const,
  troix: (id: number) => [...entiteeDeuxKeys.all, "trois", id] as const,
};

export const entiteeTroisKeys = {
  all: ["entiteeTrois"] as const,
  lists: () => [...entiteeTroisKeys.all, "list"] as const,
  list: (filters: string) => [...entiteeTroisKeys.lists(), filters] as const,
  byParent: (parentId: number | string) =>
    [...entiteeTroisKeys.all, "byParent", parentId] as const,
  details: () => [...entiteeTroisKeys.all, "detail"] as const,
  detail: (id: number | string) => [...entiteeTroisKeys.details(), id] as const,
  fonctions: (id: number | string) =>
    [...entiteeTroisKeys.detail(id), "fonctions"] as const,
  titre: () => [...entiteeTroisKeys.all, "titre"] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les entités
export const useEntitees = () => {
  const queryUn = useQuery({
    queryKey: entiteeUnKeys.lists(),
    queryFn: async (): Promise<EntiteeUn[]> => {
      const response = await getAllEntiteeUn();
      return response.entiteeUn || [];
    },
  });

  const queryDeux = useQuery({
    queryKey: entiteeDeuxKeys.lists(),
    queryFn: async (): Promise<EntiteeDeux[]> => {
      const response = await getAllEntiteeDeux();
      return response.entiteeDeux || [];
    },
  });

  const isLoading = queryUn.isLoading || queryDeux.isLoading;
  const error = queryUn.error || queryDeux.error;

  return {
    entiteeUn: queryUn.data || [],
    entiteeDeux: queryDeux.data || [],
    isLoading,
    error,
    refetch: async () => {
      await queryUn.refetch();
      await queryDeux.refetch();
    },
  };
};

// Récupérer les divisions d'une entité
export const useEntiteeDeuxByParent = (parentId: number | null) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.byParent(parentId!),
    queryFn: async (): Promise<EntiteeDeux[]> => {
      if (!parentId) return [];
      const response = await getEntiteeDeuxByEntiteeUn(parentId);
      return response.entiteeDeux || [];
    },
    enabled: !!parentId,
  });
};

// Récupérer les sections d'une division
export const useEntiteeTroisByParent = (parentId: number | null) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.troix(parentId!),
    queryFn: async (): Promise<EntiteeTrois[]> => {
      if (!parentId) return [];
      const data = await getEntiteeTroisByEntiteeDeux(parentId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!parentId,
  });
};

// Récupérer les fonctions d'une entité
export const useFonctionsByEntiteeUn = (entiteeId: number | null) => {
  return useQuery({
    queryKey: entiteeUnKeys.fonctions(entiteeId!),
    queryFn: async (): Promise<Fonction[]> => {
      if (!entiteeId) return [];
      const data = await getFunctionsByEntiteeUn(entiteeId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!entiteeId,
  });
};

export const useFonctionsByEntiteeDeux = (entiteeId: number | null) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.fonctions(entiteeId!),
    queryFn: async (): Promise<Fonction[]> => {
      if (!entiteeId) return [];
      const data = await getFunctionsByEntiteeDeux(entiteeId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!entiteeId,
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Mutations pour EntiteeUn
export const useCreateEntiteeUn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newEntitee: Partial<EntiteeUn>) => createEntiteeUn(newEntitee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
    },
  });
};

export const useUpdateEntiteeUn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EntiteeUn> }) =>
      updateEntiteeUnById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
      queryClient.invalidateQueries({
        queryKey: entiteeUnKeys.details(variables.id),
      });
    },
  });
};

export const useDeleteEntiteeUn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntiteeUnById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
    },
  });
};

// Mutations pour EntiteeDeux
export const useCreateEntiteeDeux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newEntitee: Partial<EntiteeDeux>) =>
      createEntiteeDeux(newEntitee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.all });
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
    },
  });
};

export const useUpdateEntiteeDeux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EntiteeDeux> }) =>
      updateEntiteeDeuxById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.all });
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
      queryClient.invalidateQueries({
        queryKey: entiteeDeuxKeys.details(variables.id),
      });
    },
  });
};

export const useDeleteEntiteeDeux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntiteeDeuxById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.all });
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
    },
  });
};

// Mutation pour supprimer une fonction
export const useDeleteFonction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFonctionById(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.all });
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.all });
    },
  });
};
