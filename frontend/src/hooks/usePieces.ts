// hooks/usePieces.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPieces,
  createPieces,
  updatedPieces,
  deletePieceById,
} from "../api/pieces";
import type { Pieces } from "../interfaces";

export const piecesKeys = {
  all: ["pieces"] as const,
  lists: () => [...piecesKeys.all, "list"] as const,
  list: (filters: string) => [...piecesKeys.lists(), filters] as const,
  details: () => [...piecesKeys.all, "detail"] as const,
  detail: (id: number | string) => [...piecesKeys.details(), id] as const,
};

// ✅ VERSION CORRIGÉE - La réponse est déjà un tableau !
export const usePieces = () => {
  return useQuery({
    queryKey: piecesKeys.lists(),
    queryFn: async (): Promise<Pieces[]> => {
      const response = await getPieces();
      console.log("📦 API Response:", response);

      // ✅ La réponse est déjà un tableau ! Pas besoin de .pieces
      return response; // ← CORRECTION ICI !
    },
  });
};

export const usePiece = (id: number | string | null) => {
  return useQuery({
    queryKey: piecesKeys.detail(id!),
    queryFn: async (): Promise<Pieces | null> => {
      const response = await getPieces();
      return response.find((p: Pieces) => String(p.id) === String(id)) || null;
    },
    enabled: !!id,
  });
};

// Mutations (inchangées)
export const useCreatePiece = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPiece: Partial<Pieces>) => createPieces(newPiece),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: piecesKeys.lists() });
    },
  });
};

export const useUpdatePiece = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pieces> }) =>
      updatedPieces(data, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: piecesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: piecesKeys.detail(variables.id),
      });
    },
  });
};

export const useDeletePiece = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePieceById(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: piecesKeys.lists() });
      queryClient.removeQueries({
        queryKey: piecesKeys.detail(deletedId),
      });
    },
  });
};
