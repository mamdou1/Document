import api from "./axios";
import type { Fournisseur } from "../interfaces";

export const getFournisseurs = async (): Promise<{
  fournisseur: Fournisseur[];
}> => {
  const response = await api.get("/fournisseur/");
  return response.data;
};

export const getFournisseurById = async (id: string): Promise<Fournisseur> => {
  const response = await api.get(`/fournisseur/${id}`);
  return response.data;
};

export const createFournisseur = async (
  payload: Partial<Fournisseur>
): Promise<Fournisseur> => {
  console.log("📤 Données envoyées au backend:", payload);
  try {
    const response = await api.post("/fournisseur/", payload);
    console.log("✅ Réponse du backend:", response.data);
    return response.data.fournisseur || response.data;
  } catch (error: any) {
    console.error("❌ Erreur API createFournisseur:", error);
    console.error("❌ Détails de l'erreur:", error.response?.data);
    throw error;
  }
};

/**
 * ✅ Mettre à jour un utilisateur (ADMIN) avec photo
 */
export const updateFournisseur = async (
  payload: Partial<Fournisseur>,
  id: string
): Promise<Fournisseur> => {
  const response = await api.put(`/fournisseur/${id}`, payload);
  return response.data.fournisseur || response.data;
};

export const deleteFournisseur = async (id: string): Promise<void> => {
  await api.delete(`/fournisseur/${id}`);
};
