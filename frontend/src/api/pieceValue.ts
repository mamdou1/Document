import api from "./axios";
import { PieceValue } from "../interfaces";

// =============================================
// API POUR LES VALEURS DES MÉTADONNÉES DE PIÈCES
// =============================================

/**
 * Récupérer toutes les valeurs des métadonnées pour un document
 */
export const getPieceValuesByDocument = async (
  documentId: number,
): Promise<PieceValue[]> => {
  try {
    const { data } = await api.get(`/documents/${documentId}/piece-values`);
    console.log(`✅ Valeurs des pièces pour document ${documentId}:`, data);
    return data;
  } catch (error: any) {
    console.error(
      `❌ Erreur getPieceValuesByDocument pour document ${documentId}:`,
      error,
    );
    // Retourner un tableau vide en cas d'erreur pour ne pas bloquer l'UI
    return [];
  }
};

/**
 * Récupérer les valeurs pour une pièce spécifique d'un document
 */
export const getPieceValuesByPiece = async (
  documentId: number,
  pieceId: number,
): Promise<PieceValue[]> => {
  try {
    const { data } = await api.get(
      `/documents/${documentId}/pieces/${pieceId}/values`,
    );
    console.log(`✅ Valeurs pour pièce ${pieceId}:`, data);
    return data;
  } catch (error: any) {
    console.error(
      `❌ Erreur getPieceValuesByPiece pour pièce ${pieceId}:`,
      error,
    );
    return [];
  }
};

/**
 * Mettre à jour la valeur d'une métadonnée de pièce
 */
export const updatePieceValue = async (
  valueId: number,
  value: string,
): Promise<PieceValue> => {
  try {
    const { data } = await api.put(`/piece-values/${valueId}`, { value });
    console.log("✅ Valeur mise à jour:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur updatePieceValue:", error);
    throw error;
  }
};

/**
 * Créer une nouvelle valeur pour une métadonnée de pièce
 */
export const createPieceValue = async (
  documentId: number,
  pieceId: number,
  pieceMetaFieldId: number,
  value: string | null,
  rowId?: number | null, // ✅ AJOUT du paramètre rowId (optionnel)
): Promise<PieceValue> => {
  try {
    const payload: any = {
      piece_id: pieceId,
      piece_meta_field_id: pieceMetaFieldId,
      value,
    };

    // ✅ N'ajouter row_id que s'il est fourni
    if (rowId !== undefined && rowId !== null) {
      payload.row_id = rowId;
    }

    const { data } = await api.post(
      `/documents/${documentId}/piece-values`,
      payload,
    );
    console.log("✅ Valeur créée:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur createPieceValue:", error);
    throw error;
  }
};

/**
 * Uploader un fichier pour une métadonnée de type "file"
 */
export const uploadPieceFile = async (
  documentId: number,
  pieceId: number,
  pieceValueId: number | null,
  file: File,
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("files", file);
    if (pieceValueId) {
      formData.append("piece_value_id", pieceValueId.toString());
    }

    const { data } = await api.post(
      `/documents/${documentId}/pieces/${pieceId}/upload-file`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    console.log("✅ Fichier uploadé:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur uploadPieceFile:", error);
    throw error;
  }
};

/**
 * Récupérer les fichiers d'une valeur de métadonnée
 */
export const getPieceValueFiles = async (
  documentId: number,
  pieceId: number,
  pieceValueId: number,
): Promise<any[]> => {
  try {
    const { data } = await api.get(
      `/documents/${documentId}/pieces/${pieceId}/values/${pieceValueId}/files`,
    );
    return data;
  } catch (error: any) {
    console.error("❌ Erreur getPieceValueFiles:", error);
    return [];
  }
};
