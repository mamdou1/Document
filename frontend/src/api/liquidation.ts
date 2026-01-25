import api from "./axios";
import type { Liquidation } from "../interfaces";

export const getLiquidations = async (): Promise<{
  data: Liquidation[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    console.log("🟢 Appel API: GET /api/liquidations/");
    const response = await api.get("/liquidations/");
    console.log("✅ Réponse reçue:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getLiquidations:", error);
    throw error;
  }
};

export const getLiquidationById = async (id: string): Promise<Liquidation> => {
  const response = await api.get(`/liquidations/${id}`);
  return response.data;
};
/*
export const createLiquidation = async (
  payload: Partial<Liquidation>
): Promise<Liquidation> => {
  const response = await api.post("/liquidations/", payload);
  return response.data;
};
*/

export const createLiquidation = async (
  payload: Partial<Liquidation>,
): Promise<Liquidation> => {
  try {
    console.log("📤 Payload createLiquidation :", payload);

    const response = await api.post("/liquidations/", payload);

    console.log("✅ Réponse createLiquidation :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur createLiquidation :",
      error.response?.status,
      error.response?.data || error.message,
    );
    throw error;
  }
};

// export const uploadPiece = async (
//   id: string,
//   payload: Partial<Liquidation>
// ): Promise<Liquidation> => {
//   const response = await api.put(`/liquidations/${id}`, payload);
//   return response.data;
// };

/*
la permiere option 👇
*/

// export const uploadPiece = (
//   liquidationId: number,
//   typeId: number,
//   pieceId: number,
//   files: File[]
// ) => {
//   const formData = new FormData();
//   files.forEach((f) => formData.append("files", f));

//   return api.post(
//     `/liquidations/${liquidationId}/type/${typeId}/piece/${pieceId}/files`,
//     formData,
//     { headers: { "Content-Type": "multipart/form-data" } }
//   );
// };

export const getPieceFiles = (liquidationId: number, pieceId: number) =>
  api.get(`/liquidations/${liquidationId}/piece/${pieceId}/files`);

export const deleteLiquidationById = async (id: string): Promise<void> => {
  await api.delete(`/liquidations/${id}`);
};

export const uploadPiece = async (id: string, payload: any) => {
  const { data } = await api.post(`/liquidations/${id}`, payload);
  return data; // ✅ IMPORTANT
};

// Mettre à jour la disponibilité d'une pièce

export const updatePieceDisponibilite = async (
  liquidationId: string,
  pieceId: string,
  disponible: boolean,
) => {
  const { data } = await api.patch(
    `/liquidations/${liquidationId}/pieces/${pieceId}/disponible`,
    { disponible },
  );
  return data;
};

export const getLiquidationPieces = async (liquidationId: string) => {
  const res = await api.get(`/liquidations/${liquidationId}/pieces`);
  return res.data.pieces;
};

// export const updatePieceDisponibilite = async (
//   liquidationId: string,
//   pieceId: string,
//   disponible: boolean
// ): Promise<{ message: string; disponible: boolean }> => {
//   try {
//     const response = await api.patch(
//       `/liquidations/${liquidationId}/pieces/${pieceId}/disponible`,
//       { disponible }
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Erreur updatePieceDisponibilite:", error);
//     throw error;
//   }
// };
