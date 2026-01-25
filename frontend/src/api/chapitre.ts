import api from "./axios";
import type { Chapitre } from "../interfaces";

export const getChapitres = async (): Promise<{ chapitre: Chapitre[] }> => {
  try {
    const response = await api.get("/chapitres/");
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getChapitres:", error);
    throw error;
  }
};

export const getChapitreById = async (id: string): Promise<Chapitre> => {
  const response = await api.get(`/chapitres/${id}`);
  return response.data;
};

export const getChapitreByProgramme = async (
  programmeId: number
): Promise<{ chapitres: Chapitre[] }> => {
  try {
    const response = await api.get(`/chapitres/by-programme/${programmeId}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getChapitreByProgramme:", error);
    throw error;
  }
};

export const createChapitre = async (
  payload: Partial<Chapitre>
): Promise<Chapitre> => {
  const response = await api.post("/chapitres/", payload);
  return response.data;
};

export const updateChapitreById = async (
  id: string,
  payload: Partial<Chapitre>
): Promise<Chapitre> => {
  const response = await api.put(`/chapitres/${id}`, payload);
  return response.data;
};

export const deleteChapitreById = async (id: string): Promise<void> => {
  await api.delete(`/chapitres/${id}`);
};
