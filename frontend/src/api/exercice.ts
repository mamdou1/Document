import api from "./axios";
import type { Exercice } from "../interfaces";

export const getExercices = async (): Promise<Exercice[]> => {
  try {
    console.log("🟢 Appel API: GET /api/exercices/");
    const response = await api.get("/exercices/");
    console.log("✅ Réponse reçue:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getExercices:", error);
    throw error;
  }
};

export const getExerciceById = async (id: string): Promise<Exercice> => {
  const response = await api.get(`/exercices/${id}`);
  return response.data;
};

export const createExercice = async (
  payload: Partial<Exercice>
): Promise<Exercice> => {
  try {
    const response = await api.post("/exercices/", payload);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur createExercice:", error);
    throw error;
  }
};

export const updateExerciceById = async (
  id: string,
  payload: Partial<Exercice>
): Promise<Exercice> => {
  const response = await api.put(`/exercices/${id}`, payload);
  return response.data;
};

export const deleteExerciceById = async (id: string): Promise<void> => {
  await api.delete(`/exercices/${id}`);
};
