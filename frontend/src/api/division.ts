import api from "./axios";
import type { Division, Fonction } from "../interfaces";

const API_URL = "/divisions";

export const getAllDivision = async (): Promise<{ divisions: Division[] }> => {
  // Changé ici
  try {
    const response = await api.get(`${API_URL}/`);
    return response.data;
    // Note : Si votre backend renvoie { "division": [...] },
    // changez la ligne ci-dessus par : return { divisions: response.data.division };
  } catch (error: any) {
    console.error("❌ Erreur getAllDivision:", error);
    throw error;
  }
};

export const getDivisionsByService = async (
  serviceId: number,
): Promise<{ divisions: Division[] }> => {
  try {
    const response = await api.get(`${API_URL}/by-service/${serviceId}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getDivisionsByService:", error);
    throw error;
  }
};

export const createDivision = async (
  payload: Partial<Division>,
): Promise<Division> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

export const getFunctionsByDivision = async (
  id: number,
): Promise<Fonction[]> => {
  const response = await api.get(`${API_URL}/${id}/fonctions`);
  return response.data;
};

export const updateDivisionById = async (
  id: number,
  payload: Partial<Division>,
): Promise<Division> => {
  const response = await api.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteDivisionById = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};
