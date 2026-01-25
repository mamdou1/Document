import api from "./axios";
import type { TypeDocument, CreateTypeDocumentPayload } from "../interfaces";

export const getTypeDocuments = async (): Promise<TypeDocument[]> => {
  const response = await api.get("/types-documents");
  return response.data.types || response.data;
};

export const getTypeDocumentById = async (
  id: string,
): Promise<TypeDocument> => {
  const response = await api.get(`/types-documents/${id}`);
  return response.data.type || response.data;
};

export const createTypeDocument = async (
  payload: CreateTypeDocumentPayload,
): Promise<TypeDocument> => {
  console.log("📤 createTypeDocument:", payload);
  const response = await api.post("/types-documents", payload);
  return response.data.type || response.data;
};

export const updateTypeDocument = async (
  id: string,
  payload: Partial<TypeDocument>,
): Promise<TypeDocument> => {
  const response = await api.put(`/types-documents/${id}`, payload);
  return response.data.type || response.data;
};

export const deleteTypeDocument = async (id: string): Promise<void> => {
  await api.delete(`/types-documents/${id}`);
};
