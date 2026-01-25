import api from "./axios";
import type { Fonction } from "../interfaces";

// Récupérer toutes les fonctions
export const getFonctions = async (): Promise<{ fonctions: Fonction[] }> => {
  try {
    const response = await api.get("/fonctions/");
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getFonctions:", error);
    throw error;
  }
};

// Récupérer une fonction par son ID
export const getFonctionById = async (id: number): Promise<Fonction> => {
  const response = await api.get(`/fonctions/${id}`);
  return response.data;
};

// Créer une nouvelle fonction (liée à un service, division ou section)
export const createFonction = async (
  payload: Partial<Fonction>
): Promise<Fonction> => {
  const response = await api.post("/fonctions/", payload);
  return response.data;
};

// Mettre à jour une fonction
export const updateFonctionById = async (
  id: number,
  payload: Partial<Fonction>
): Promise<Fonction> => {
  const response = await api.put(`/fonctions/${id}`, payload);
  return response.data;
};

// Supprimer une fonction
export const deleteFonctionById = async (id: number): Promise<void> => {
  await api.delete(`/fonctions/${id}`);
};

/**
 * Fonctions de filtrage pour les dropdowns dépendants
 */

// Récupérer les fonctions d'un Service
export const getFonctionsByService = async (serviceId: number): Promise<Fonction[]> => {
  const response = await api.get(`/fonctions/by-service/${serviceId}`);
  return response.data;
};

// Récupérer les fonctions d'une Division
export const getFonctionsByDivision = async (divisionId: number): Promise<Fonction[]> => {
  const response = await api.get(`/fonctions/by-division/${divisionId}`);
  return response.data;
};

// Récupérer les fonctions d'une Section
export const getFonctionsBySection = async (sectionId: number): Promise<Fonction[]> => {
  const response = await api.get(`/fonctions/by-section/${sectionId}`);
  return response.data;
};