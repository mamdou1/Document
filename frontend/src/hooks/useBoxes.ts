// hooks/useBoxes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBoxes, createBox, updateBox, deleteBox } from "../api/box";
import type { Box } from "../interfaces";

// Clés de cache
export const boxKeys = {
  all: ["boxes"] as const,
  lists: () => [...boxKeys.all, "list"] as const,
  list: (filters: string) => [...boxKeys.lists(), filters] as const,
  details: () => [...boxKeys.all, "detail"] as const,
  detail: (id: number) => [...boxKeys.details(), id] as const,
};

// Hook pour récupérer tous les boxes
export const useBoxes = () => {
  return useQuery({
    queryKey: boxKeys.lists(),
    queryFn: async () => {
      const data = await getBoxes();
      return Array.isArray(data) ? data : [];
    },
  });
};

// Hook pour créer un box
export const useCreateBox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBox: Partial<Box>) => createBox(newBox),
    onSuccess: (savedBox) => {
      // ✅ Invalide le cache pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: boxKeys.lists() });

      // ✅ Mise à jour optimiste (optionnel)
      // queryClient.setQueryData(boxKeys.lists(), (old: Box[] = []) => {
      //   return [savedBox, ...old];
      // });
    },
  });
};

// Hook pour mettre à jour un box
export const useUpdateBox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Box> }) =>
      updateBox(id, data),
    onSuccess: (updatedBox) => {
      queryClient.invalidateQueries({ queryKey: boxKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: boxKeys.detail(updatedBox.id),
      });
    },
  });
};

// Hook pour supprimer un box
export const useDeleteBox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBox(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: boxKeys.lists() });
    },
  });
};
