import api from "./axios";
import type { Nature } from "../interfaces";

export const getNatures = async (): Promise<{ nature: Nature[] }> => {
  try {
    const response = await api.get("/natures/");
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getNatures:", error);
    throw error;
  }
};

export const getNatureById = async (id: string): Promise<Nature> => {
  const response = await api.get(`/natures/${id}`);
  return response.data;
};

export const getNatureChapitre = async (
  chapitreId: number
): Promise<{ matures: Nature[] }> => {
  try {
    const response = await api.get(`/natures/by-nature/${chapitreId}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getNatureProgramme:", error);
    throw error;
  }
};

export const createNature = async (
  payload: Partial<Nature>
): Promise<Nature> => {
  const response = await api.post("/natures/", payload);
  return response.data;
};

export const updateNatureById = async (
  id: string,
  payload: Partial<Nature>
): Promise<Nature> => {
  const response = await api.put(`/natures/${id}`, payload);
  return response.data;
};

export const deleteNatureById = async (id: string): Promise<void> => {
  await api.delete(`/natures/${id}`);
};
