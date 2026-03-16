import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDroits,
  createDroit,
  updateDroitById,
  deleteDroitById,
} from "../api/droit";
import type { Droit } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const droitKeys = {
  all: ["droits"] as const,
  lists: () => [...droitKeys.all, "list"] as const,
  list: (filters: string) => [...droitKeys.lists(), filters] as const,
  details: () => [...droitKeys.all, "detail"] as const,
  detail: (id: number | string) => [...droitKeys.details(), id] as const, // ✅ Accepter number ou string
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer tous les droits
export const useDroits = () => {
  return useQuery({
    queryKey: droitKeys.lists(),
    queryFn: async () => {
      const data = await getDroits();
      return Array.isArray(data) ? data : [];
    },
  });
};

// Récupérer un droit spécifique - ✅ VERSION CORRIGÉE
export const useDroit = (id: number | string | null) => {
  return useQuery({
    queryKey: droitKeys.detail(id!),
    queryFn: async () => {
      const data = await getDroits();
      // ✅ Convertir en string pour la comparaison (car les IDs peuvent être string dans l'API)
      return data.find((d: Droit) => String(d.id) === String(id)) || null;
    },
    enabled: !!id,
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer un droit
export const useCreateDroit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newDroit: Partial<Droit>) => createDroit(newDroit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: droitKeys.lists() });
    },
  });
};

// Mettre à jour un droit
export const useUpdateDroit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Droit> }) =>
      updateDroitById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: droitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: droitKeys.detail(variables.id), // ✅ variables.id est déjà string
      });
    },
  });
};

// Supprimer un droit
export const useDeleteDroit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDroitById(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: droitKeys.lists() });
      queryClient.removeQueries({
        queryKey: droitKeys.detail(deletedId),
      });
    },
  });
};




