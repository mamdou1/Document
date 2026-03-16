// hooks/useRayons.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRayons, createRayon, updateRayon, deleteRayon } from "../api/rayon";
import type { Rayon } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const rayonKeys = {
  all: ["rayons"] as const,
  lists: () => [...rayonKeys.all, "list"] as const,
  list: (filters: string) => [...rayonKeys.lists(), filters] as const,
  details: () => [...rayonKeys.all, "detail"] as const,
  detail: (id: number | string) => [...rayonKeys.details(), id] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer tous les rayons
export const useRayons = () => {
  return useQuery({
    queryKey: rayonKeys.lists(),
    queryFn: async (): Promise<Rayon[]> => {
      const data = await getRayons();
      return Array.isArray(data) ? data : [];
    },
  });
};

// Récupérer un rayon spécifique
export const useRayon = (id: number | string | null) => {
  return useQuery({
    queryKey: rayonKeys.detail(id!),
    queryFn: async (): Promise<Rayon | null> => {
      const data = await getRayons();
      const rayons = Array.isArray(data) ? data : [];
      return rayons.find((r: Rayon) => String(r.id) === String(id)) || null;
    },
    enabled: !!id,
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer un rayon
export const useCreateRayon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newRayon: Partial<Rayon>) => createRayon(newRayon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rayonKeys.lists() });
    },
  });
};

// Mettre à jour un rayon
export const useUpdateRayon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Rayon> }) =>
      updateRayon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rayonKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: rayonKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer un rayon
export const useDeleteRayon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRayon(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: rayonKeys.lists() });
      queryClient.removeQueries({
        queryKey: rayonKeys.detail(deletedId),
      });
    },
  });
};
