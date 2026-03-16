import api from "./axios";
import type { Droit, User } from "../interfaces";

export const getDroits = async (): Promise<Droit[]> => {
  try {
    console.log("🟢 Appel API: GET /api/droits/");
    const response = await api.get("/droits/");
    console.log("✅ Réponse reçue:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getDroits:", error);
    throw error;
  }
};

export const getDroitById = async (id: string): Promise<Droit> => {
  const response = await api.get(`/droits/${id}`);
  return response.data;
};

export const createDroit = async (payload: Partial<Droit>): Promise<Droit> => {
  try {
    const response = await api.post("/droits/", payload);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur createDroit:", error);
    throw error;
  }
};

export const updateDroitById = async (
  id: string,
  payload: Partial<Droit>,
): Promise<Droit> => {
  const response = await api.put(`/droits/${id}`, payload);
  return response.data;
};

export const deleteDroitById = async (id: string): Promise<void> => {
  await api.delete(`/droits/${id}`);
};

// Récupérer tous les agents d’un droit donné
export const getAgentsByDroit = async (
  droitId: string | number,
): Promise<User[]> => {
  const { data } = await api.get(`/droits/${droitId}/agents`);
  return data;
};
