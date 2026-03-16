import api from "./axios";

// ------------------- SALLE -------------------
export const createSalle = async (payload: any) => {
  const { data } = await api.post("/salle", payload);
  return data;
};

export const getSalles = async () => {
  const { data } = await api.get("/salle");
  return data;
};

export const getSalleById = async (id: string) => {
  const { data } = await api.get(`/salle/${id}`);
  return data;
};

export const updateSalle = async (id: string, payload: any) => {
  const { data } = await api.put(`/salle/${id}`, payload);
  return data;
};

export const deleteSalle = async (id: string) => {
  const { data } = await api.delete(`/salle/${id}`);
  return data;
};

export const getRayonsBySalle = async (salleId: string) => {
  const { data } = await api.get(`/salle/${salleId}/rayon`);
  return data;
};
