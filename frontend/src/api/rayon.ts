import api from "./axios";

// ------------------- Rayon -------------------
export const createRayon = async (payload: any) => {
  const { data } = await api.post("/rayon", payload);
  return data;
};

export const getRayons = async () => {
  const { data } = await api.get("/rayon");
  return data;
};

export const getRayonById = async (id: string) => {
  const { data } = await api.get(`/rayon/${id}`);
  return data;
};

export const updateRayon = async (id: string, payload: any) => {
  const { data } = await api.put(`/rayon/${id}`, payload);
  return data;
};

export const deleteRayon = async (id: string) => {
  const { data } = await api.delete(`/rayon/${id}`);
  return data;
};

export const getTraveByRayon = async (rayonId: string) => {
  const { data } = await api.get(`/rayon/${rayonId}/trave`);
  return data;
};
