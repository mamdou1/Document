import api from "./axios";

export const getTotalByProgramme = async () => {
  const res = await api.get("/statistiques/programme");
  return res.data;
};

export const getTotalByChapitre = async () => {
  const res = await api.get("/statistiques/chapitre");
  return res.data;
};

export const getTotalByNature = async () => {
  const res = await api.get("/statistiques/nature");
  return res.data;
};
