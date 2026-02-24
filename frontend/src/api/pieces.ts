import api from "./axios";
import type { Pieces } from "../interfaces";

export const createPieces = async (
  payload: Partial<Pieces>,
): Promise<Pieces> => {
  console.log("📤 createTypeDocument:", payload);
  const response = await api.post("/pieces/", payload);
  return response.data.pieces || response.data;
};

export const getPieces = async (): Promise<Pieces[]> => {
  const response = await api.get("/pieces/");
  return response.data;
};

export const updatedPieces = async (
  payload: Partial<Pieces>,
  id: string,
): Promise<Pieces> => {
  const response = await api.put(`/pieces/${id}`, payload);
  return response.data;
};

export const deletePieceById = async (id: string): Promise<void> => {
  await api.delete(`/pieces/${id}`);
};
