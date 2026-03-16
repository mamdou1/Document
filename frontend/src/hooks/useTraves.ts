// hooks/useTraves.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTraves, createTrave, updateTrave, deleteTrave } from "../api/trave";
import type { Trave } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const traveKeys = {
  all: ["traves"] as const,
  lists: () => [...traveKeys.all, "list"] as const,
  list: (filters: string) => [...traveKeys.lists(), filters] as const,
  details: () => [...traveKeys.all, "detail"] as const,
  detail: (id: number | string) => [...traveKeys.details(), id] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les travées
export const useTraves = () => {
  return useQuery({
    queryKey: traveKeys.lists(),
    queryFn: async (): Promise<Trave[]> => {
      const data = await getTraves();
      return Array.isArray(data) ? data : [];
    },
  });
};

// Récupérer une travée spécifique
export const useTrave = (id: number | string | null) => {
  return useQuery({
    queryKey: traveKeys.detail(id!),
    queryFn: async (): Promise<Trave | null> => {
      const data = await getTraves();
      const traves = Array.isArray(data) ? data : [];
      return traves.find((t: Trave) => String(t.id) === String(id)) || null;
    },
    enabled: !!id,
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer une travée
export const useCreateTrave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTrave: Partial<Trave>) => createTrave(newTrave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: traveKeys.lists() });
    },
  });
};

// Mettre à jour une travée
export const useUpdateTrave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Trave> }) =>
      updateTrave(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: traveKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: traveKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer une travée
export const useDeleteTrave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrave(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: traveKeys.lists() });
      queryClient.removeQueries({
        queryKey: traveKeys.detail(deletedId),
      });
    },
  });
};
