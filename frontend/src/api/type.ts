import api from "./axios";
import type {
  Type,
  AddPiecesToTypePayload,
  CreateTypePayload,
} from "../interfaces";

export const createType = async (payload: CreateTypePayload): Promise<Type> => {
  const response = await api.post("/type/", payload);
  return response.data.type;
};

export const getType = async (): Promise<{ type: Type[] }> => {
  const response = await api.get("/type/");
  return response.data;
};

export const addPiecesToType = async (
  typeId: string,
  payload: AddPiecesToTypePayload,
): Promise<{ message: string }> => {
  const response = await api.post(`/type/${typeId}/pieces`, payload);
  return response.data;
};

export const deleteType = async (id: string): Promise<void> => {
  await api.delete(`/type/${id}`);
};
