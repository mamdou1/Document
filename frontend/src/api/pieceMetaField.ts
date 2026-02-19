import api from "./axios";
import { PieceMetaField, CreatePieceMetaFieldPayload } from "../interfaces";

// =============================================
// API POUR LES MÉTADONNÉES DES PIÈCES
// =============================================

/**
 * Récupérer toutes les métadonnées d'une pièce
 */
export const getPieceMetaFields = async (
  pieceId: string,
): Promise<PieceMetaField[]> => {
  try {
    const { data } = await api.get(`/pieces/${pieceId}/meta-fields`);
    console.log(`✅ Métadonnées de la pièce ${pieceId} chargées:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ Erreur getPieceMetaFields pour pièce ${pieceId}:`, error);
    throw error;
  }
};

/**
 * Créer une nouvelle métadonnée pour une pièce
 */
export const createPieceMetaField = async (
  pieceId: string,
  payload: CreatePieceMetaFieldPayload,
): Promise<PieceMetaField> => {
  try {
    const { data } = await api.post(`/pieces/${pieceId}/meta-fields`, payload);
    console.log("✅ Métadonnée créée:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur createPieceMetaField:", error);
    throw error;
  }
};

/**
 * Mettre à jour une métadonnée
 */
export const updatePieceMetaField = async (
  id: number,
  payload: Partial<CreatePieceMetaFieldPayload>,
): Promise<PieceMetaField> => {
  try {
    const { data } = await api.put(`/pieces/meta-fields/${id}`, payload);
    console.log("✅ Métadonnée mise à jour:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur updatePieceMetaField:", error);
    throw error;
  }
};

/**
 * Supprimer une métadonnée
 */
export const deletePieceMetaField = async (
  id: number,
): Promise<{ success: boolean }> => {
  try {
    const { data } = await api.delete(`/pieces/meta-fields/${id}`);
    console.log("✅ Métadonnée supprimée");
    return data;
  } catch (error: any) {
    console.error("❌ Erreur deletePieceMetaField:", error);
    throw error;
  }
};
