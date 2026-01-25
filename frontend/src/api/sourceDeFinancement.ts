import api from "./axios";
import type { SourceDeFinancement } from "../interfaces";

export const getSourceDeFinancements = async (): Promise<{
  source: SourceDeFinancement[];
}> => {
  const response = await api.get("/sourceDeFinancement/");
  return response.data;
};

export const getSourceDeFinancementById = async (
  id: string,
): Promise<SourceDeFinancement> => {
  const response = await api.get(`/sourceDeFinancement/${id}`);
  return response.data;
};

export const createSourceDeFinancement = async (
  payload: Partial<SourceDeFinancement>,
): Promise<SourceDeFinancement> => {
  console.log("📤 Données envoyées au backend:", payload);
  try {
    const response = await api.post("/sourceDeFinancement/", payload);
    console.log("✅ Réponse du backend:", response.data);
    return response.data.sourceDeFinancement || response.data;
  } catch (error: any) {
    console.error("❌ Erreur API createSourceDeFinancement:", error);
    console.error("❌ Détails de l'erreur:", error.response?.data);
    throw error;
  }
};

/**
 *  Mettre à jour
 */
export const updateSourceDeFinancement = async (
  payload: Partial<SourceDeFinancement>,
  id: string,
): Promise<SourceDeFinancement> => {
  const response = await api.put(`/sourceDeFinancement/${id}`, payload);
  return response.data.sourceDeFinancement || response.data;
};

export const deleteSourceDeFinancement = async (id: string): Promise<void> => {
  await api.delete(`/sourceDeFinancement/${id}`);
};
