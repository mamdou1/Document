import api from "./axios";
import { PieceFichier } from "../interfaces";

/**
 * Upload MULTIPLE de fichiers pour une pièce
 */
export const uploadPieceFichiers = (pieceId: string, files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file); // même nom que multer.array("files")
  });

  return api.post(`/pieces/${pieceId}/fichiers`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 📥 Récupérer tous les fichiers d'une pièce
 */
export const getPieceFichiers = (pieceId: string) => {
  return api.get<PieceFichier[]>(`/pieces/${pieceId}/fichiers`);
};

/**
 * 🗑 Supprimer un fichier précis
 */
export const deletePieceFichier = (fichierId: string) => {
  return api.delete(`/pieces/fichiers/${fichierId}`);
};
