import api from "./axios";
import type { Document, CreateDocumentPayload } from "../interfaces";

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get("/documents");
  return response.data;
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const response = await api.get(`/documents/${id}`);
  return response.data.document || response.data;
};

export const createDocument = async (
  payload: CreateDocumentPayload,
): Promise<Document> => {
  console.log("📤 createDocument:", payload);
  const response = await api.post("/documents", payload);
  return response.data;
};

export const updateDocument = async (
  id: string,
  payload: any,
): Promise<Document> => {
  const response = await api.put(`/documents/${id}`, payload);
  return response.data.document || response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const updateDocumentPieceDisponibilite = async (
  documentId: string,
  pieceId: string,
  disponible: boolean,
) => {
  const { data } = await api.patch(
    `/documents/${documentId}/pieces/${pieceId}/disponible`,
    { disponible },
  );
  return data;
};

export const getDocumentPieces = async (documentId: string) => {
  const res = await api.get(`/documents/${documentId}/pieces`);
  return res.data.pieces;
};

export const getDocumentFiles = (documentId: number, pieceId: number) =>
  api.get(`/documents/${documentId}/piece/${pieceId}/files`);
