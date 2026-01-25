import api from "./axios";
import type { Piece } from "../interfaces";

// 🔎 Récupérer tous les dossiers
export const getDossiers = async (): Promise<Piece[]> => {
  try {
    const response = await api.get("/dossiers/");
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getDossiers:", error);
    throw error;
  }
};

// 🔎 Récupérer un dossier par ID
export const getDossierById = async (id: string): Promise<Piece> => {
  const response = await api.get(`/dossiers/${id}`);
  return response.data;
};

// ➕ Créer un dossier (avec fichiers)
export const createDossier = async (payload: FormData): Promise<Piece> => {
  const response = await api.post("/dossiers/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 🔄 Mettre à jour un dossier par ID
export const updateDossierById = async (
  id: string,
  payload: FormData
): Promise<Piece> => {
  const response = await api.put(`/dossiers/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ❌ Supprimer un dossier par ID
export const deleteDossierById = async (id: string): Promise<void> => {
  await api.delete(`/dossiers/${id}`);
};
