// import axios from "axios";
// import { Section, Fonction } from "../interfaces";

// const API_URL = "/api/sections";

// export const getSectionsByDivision = (divisionId: number) =>
//   axios.get<Section[]>(`${API_URL}/by-division/${divisionId}`);

// export const createSection = (data: Partial<Section>) =>
//   axios.post(API_URL, data);

// export const getFunctionsBySection = (id: number) =>
//   axios.get<Fonction[]>(`${API_URL}/${id}/fonctions`);

import api from "./axios";
import type { Section, Fonction } from "../interfaces";

const API_URL = "/sections";

export const getAllSections = async (): Promise<{ services: Section[] }> => {
  try {
    const response = await api.get(`${API_URL}/`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getSection:", error);
    throw error;
  }
};

export const getSectionsByDivision = async (
  divisionId: number,
): Promise<Section[]> => {
  try {
    const response = await api.get(`${API_URL}/by-division/${divisionId}`);
    return response.data; // ✅ directement un tableau
  } catch (error: any) {
    console.error("❌ Erreur getSectionsByDivision:", error);
    throw error;
  }
};

export const createSection = async (
  payload: Partial<Section>,
): Promise<Section> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

export const getFunctionsBySection = async (
  id: number,
): Promise<Fonction[]> => {
  const response = await api.get(`${API_URL}/${id}/fonctions`);
  return response.data;
};

export const updateSectionById = async (
  id: number,
  payload: Partial<Section>,
): Promise<Section> => {
  const response = await api.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteSectionById = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};
