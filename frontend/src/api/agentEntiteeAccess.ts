import api from "../api/axios";
import { GrantAccessPayload, UpdateAccessPayload } from "../interfaces";

// ➡️ Créer un accès
export const grantAccess = async (payload: GrantAccessPayload[]) => {
  try {
    const { data } = await api.post("/agent-access", payload);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur grantAccess:", error);
    throw error;
  }
};

// ➡️ Mettre à jour un accès
export const updateAccess = async (
  id: number,
  payload: UpdateAccessPayload,
) => {
  try {
    const { data } = await api.put(`/agent-access/${id}`, payload);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur updateAccess:", error);
    throw error;
  }
};

// ➡️ Récupérer les accès d’un agent par son ID
export const getAgentAccessById = async (agentId: number) => {
  try {
    const { data } = await api.get(`/agent-access/${agentId}`);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur getAgentAccessById:", error);
    throw error;
  }
};

// ➡️ Révoquer un accès
export const revokeAccess = async (id: number) => {
  try {
    // 🔍 DEBUG
    console.log(`🗑️ Révocation de l'accès ID: ${id}`);

    const { data } = await api.delete(`/agent-access/${id}`);

    console.log(`✅ Accès ${id} révoqué avec succès`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ Erreur revokeAccess (ID: ${id}):`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    throw error;
  }
};

// ➡️ Lister tous les accès
export const listAccess = async () => {
  try {
    const { data } = await api.get("/agent-access");
    return data;
  } catch (error: any) {
    console.error("❌ Erreur listAccess:", error);
    throw error;
  }
};

// Utilitaires
export const isValidAccessPayload = (payload: GrantAccessPayload): boolean => {
  return !!(
    payload.entitee_un_id ||
    payload.entitee_deux_id ||
    payload.entitee_trois_id
  );
};

export const getAccessEntityLabel = (access: any): string => {
  return (
    access.entitee_un?.libelle ||
    access.entitee_deux?.libelle ||
    access.entitee_trois?.libelle ||
    "Entité inconnue"
  );
};
