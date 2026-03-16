import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSalles, createSalle, updateSalle, deleteSalle } from "../api/salle";
import type { Salle } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const salleKeys = {
  all: ["salles"] as const,
  lists: () => [...salleKeys.all, "list"] as const,
  list: (filters: string) => [...salleKeys.lists(), filters] as const,
  details: () => [...salleKeys.all, "detail"] as const,
  detail: (id: number | string) => [...salleKeys.details(), id] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les salles
export const useSalles = () => {
  return useQuery({
    queryKey: salleKeys.lists(),
    queryFn: async (): Promise<Salle[]> => {
      const response = await getSalles();
      // Gérer les différents formats de réponse possibles
      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.salle)) {
        return response.salle;
      }
      return [];
    },
  });
};

// Récupérer une salle spécifique
export const useSalle = (id: number | string | null) => {
  return useQuery({
    queryKey: salleKeys.detail(id!),
    queryFn: async (): Promise<Salle | null> => {
      const response = await getSalles();
      let salles: Salle[] = [];

      if (Array.isArray(response)) {
        salles = response;
      } else if (response && Array.isArray(response.salle)) {
        salles = response.salle;
      }

      return salles.find((s: Salle) => String(s.id) === String(id)) || null;
    },
    enabled: !!id,
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer une salle
export const useCreateSalle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSalle: Partial<Salle>) => createSalle(newSalle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salleKeys.lists() });
    },
  });
};

// Mettre à jour une salle
export const useUpdateSalle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Salle> }) =>
      updateSalle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: salleKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer une salle
export const useDeleteSalle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSalle(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: salleKeys.lists() });
      queryClient.removeQueries({
        queryKey: salleKeys.detail(deletedId),
      });
    },
  });
};
