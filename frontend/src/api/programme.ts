import api from "./axios";
import type { Programme } from "../interfaces";

export const getProgrammes = async (): Promise<{ programme: Programme[] }> => {
  try {
    const response = await api.get("/programmes/");
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getProgrammes:", error);
    throw error;
  }
};

export const getProgrammeById = async (id: string): Promise<Programme> => {
  const response = await api.get(`/programmes/${id}`);
  return response.data;
};

export const createProgramme = async (
  payload: Partial<Programme>
): Promise<Programme> => {
  const response = await api.post("/programmes/", payload);
  return response.data;
};

export const updateProgrammeById = async (
  id: string,
  payload: Partial<Programme>
): Promise<Programme> => {
  const response = await api.put(`/programmes/${id}`, payload);
  return response.data;
};

export const deleteProgrammeById = async (id: string): Promise<void> => {
  await api.delete(`/programmes/${id}`);
};
