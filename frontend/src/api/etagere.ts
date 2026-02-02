import api from "./axios";

// ------------------- ETAGERE -------------------
export const createEtagere = async (payload: any) => {
  const { data } = await api.post("/etagere", payload);
  return data;
};

export const getEtageres = async () => {
  const { data } = await api.get("/etagere");
  return data;
};

export const getEtagereById = async (id: string) => {
  const { data } = await api.get(`/etagere/${id}`);
  return data;
};

export const updateEtagere = async (id: string, payload: any) => {
  const { data } = await api.put(`/etagere/${id}`, payload);
  return data;
};

export const deleteEtagere = async (id: string) => {
  const { data } = await api.delete(`/etagere/${id}`);
  return data;
};

export const getBoxesByEtagere = async (etagereId: string) => {
  const { data } = await api.get(`/etagere/${etagereId}/box`);
  return data;
};
