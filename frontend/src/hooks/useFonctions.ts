import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFonctions,
  getFonctionById,
  createFonction,
  updateFonctionById,
  deleteFonctionById,
  getFonctionsByService,
  getFonctionsByDivision,
  getFonctionsBySection,
} from "../api/fonction";
import { getAllEntiteeUn } from "../api/entiteeUn";
import { getAllEntiteeDeux } from "../api/entiteeDeux";
import { getAllEntiteeTrois } from "../api/entiteeTrois";
import type {
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const fonctionKeys = {
  all: ["fonctions"] as const,
  lists: () => [...fonctionKeys.all, "list"] as const,
  list: (filters: string) => [...fonctionKeys.lists(), filters] as const,
  details: () => [...fonctionKeys.all, "detail"] as const,
  detail: (id: number) => [...fonctionKeys.details(), id] as const,
  byService: (serviceId: number) =>
    [...fonctionKeys.all, "byService", serviceId] as const,
  byDivision: (divisionId: number) =>
    [...fonctionKeys.all, "byDivision", divisionId] as const,
  bySection: (sectionId: number) =>
    [...fonctionKeys.all, "bySection", sectionId] as const,
};

export const entiteeKeys = {
  un: ["entiteeUn"] as const,
  deux: ["entiteeDeux"] as const,
  trois: ["entiteeTrois"] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les fonctions
export const useFonctions = () => {
  return useQuery({
    queryKey: fonctionKeys.lists(),
    queryFn: async () => {
      const res = await getFonctions();
      console.log("📦 Données reçues de l'API:", res);
      if (Array.isArray(res)) {
        return res;
      }

      if (res && Array.isArray(res.fonctions)) {
        return res.fonctions;
      }

      return [];
    },
  });
};

// Récupérer une fonction par ID
export const useFonctionById = (id: number) => {
  return useQuery({
    queryKey: fonctionKeys.detail(id),
    queryFn: () => getFonctionById(id),
    enabled: !!id,
  });
};

// Récupérer les fonctions par service
export const useFonctionsByService = (serviceId: number) => {
  return useQuery({
    queryKey: fonctionKeys.byService(serviceId),
    queryFn: () => getFonctionsByService(serviceId),
    enabled: !!serviceId,
  });
};

// Récupérer les fonctions par division
export const useFonctionsByDivision = (divisionId: number) => {
  return useQuery({
    queryKey: fonctionKeys.byDivision(divisionId),
    queryFn: () => getFonctionsByDivision(divisionId),
    enabled: !!divisionId,
  });
};

// Récupérer les fonctions par section
export const useFonctionsBySection = (sectionId: number) => {
  return useQuery({
    queryKey: fonctionKeys.bySection(sectionId),
    queryFn: () => getFonctionsBySection(sectionId),
    enabled: !!sectionId,
  });
};

// Récupérer toutes les entités
export const useEntitees = () => {
  const queryUn = useQuery({
    queryKey: entiteeKeys.un,
    queryFn: async () => {
      const res = await getAllEntiteeUn();
      return Array.isArray(res) ? res : [];
    },
  });

  const queryDeux = useQuery({
    queryKey: entiteeKeys.deux,
    queryFn: async () => {
      const res = await getAllEntiteeDeux();
      return Array.isArray(res) ? res : [];
    },
  });

  const queryTrois = useQuery({
    queryKey: entiteeKeys.trois,
    queryFn: async () => {
      const res = await getAllEntiteeTrois();
      return Array.isArray(res) ? res : [];
    },
  });

  return {
    entiteeUn: queryUn.data || [],
    entiteeDeux: queryDeux.data || [],
    entiteeTrois: queryTrois.data || [],
    isLoading: queryUn.isLoading || queryDeux.isLoading || queryTrois.isLoading,
    error: queryUn.error || queryDeux.error || queryTrois.error,
    refetch: async () => {
      await Promise.all([
        queryUn.refetch(),
        queryDeux.refetch(),
        queryTrois.refetch(),
      ]);
    },
  };
};

// Hook combiné pour charger toutes les données initiales
export const useInitialData = () => {
  const fonctionsQuery = useFonctions();
  const entitees = useEntitees();

  const isLoading = fonctionsQuery.isLoading || entitees.isLoading;
  const error = fonctionsQuery.error || entitees.error;

  return {
    fonctions: fonctionsQuery.data || [],
    entiteeUn: entitees.entiteeUn,
    entiteeDeux: entitees.entiteeDeux,
    entiteeTrois: entitees.entiteeTrois,
    isLoading,
    error,
    refetch: async () => {
      await fonctionsQuery.refetch();
      await entitees.refetch();
    },
  };
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer une fonction
export const useCreateFonction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newFonction: Partial<Fonction>) => createFonction(newFonction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fonctionKeys.lists() });
    },
  });
};

// Mettre à jour une fonction
export const useUpdateFonction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Fonction> }) =>
      updateFonctionById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fonctionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: fonctionKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer une fonction
export const useDeleteFonction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFonctionById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fonctionKeys.lists() });
    },
  });
};
