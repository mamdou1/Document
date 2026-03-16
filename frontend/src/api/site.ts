import api from "./axios";

// ------------------- Site -------------------
export const createSite = async (payload: any) => {
  const { data } = await api.post("/site", payload);
  return data;
};

export const getSites = async () => {
  const { data } = await api.get("/site");
  return data;
};

export const getSiteById = async (id: string) => {
  const { data } = await api.get(`/site/${id}`);
  return data;
};

export const updateSite = async (id: string, payload: any) => {
  const { data } = await api.put(`/site/${id}`, payload);
  return data;
};

export const deleteSite = async (id: string) => {
  const { data } = await api.delete(`/site/${id}`);
  return data;
};

export const getSalleBySite = async (siteId: string) => {
  const { data } = await api.get(`/site/${siteId}/salle`);
  return data;
};
