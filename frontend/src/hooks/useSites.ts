// hooks/useSites.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSites, createSite, updateSite, deleteSite } from "../api/site";
import type { Site } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const siteKeys = {
  all: ["sites"] as const,
  lists: () => [...siteKeys.all, "list"] as const,
  list: (filters: string) => [...siteKeys.lists(), filters] as const,
  details: () => [...siteKeys.all, "detail"] as const,
  detail: (id: number | string) => [...siteKeys.details(), id] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer tous les sites
export const useSites = () => {
  return useQuery({
    queryKey: siteKeys.lists(),
    queryFn: async (): Promise<Site[]> => {
      const response = await getSites();
      // Gérer les différents formats de réponse possibles
      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.site)) {
        return response.site;
      }
      return [];
    },
  });
};

// Récupérer un site spécifique
export const useSite = (id: number | string | null) => {
  return useQuery({
    queryKey: siteKeys.detail(id!),
    queryFn: async (): Promise<Site | null> => {
      const response = await getSites();
      let sites: Site[] = [];

      if (Array.isArray(response)) {
        sites = response;
      } else if (response && Array.isArray(response.site)) {
        sites = response.site;
      }

      return sites.find((s: Site) => String(s.id) === String(id)) || null;
    },
    enabled: !!id,
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer un site
export const useCreateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSite: Partial<Site>) => createSite(newSite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
    },
  });
};

// Mettre à jour un site
export const useUpdateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Site> }) =>
      updateSite(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: siteKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer un site
export const useDeleteSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSite(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.removeQueries({
        queryKey: siteKeys.detail(deletedId),
      });
    },
  });
};
