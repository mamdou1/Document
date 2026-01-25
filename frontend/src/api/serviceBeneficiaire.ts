import api from "./axios";
import type { ServiceBeneficiaire } from "../interfaces";

export const getServiceBeneficiaire = async (): Promise<{
  serviceBeneficiaire: ServiceBeneficiaire[];
}> => {
  const response = await api.get("/serviceBeneficiaire/");
  return response.data;
};

export const getServiceBeneficiareById = async (
  id: string
): Promise<ServiceBeneficiaire> => {
  const response = await api.get(`/serviceBeneficiaire/${id}`);
  return response.data;
};

export const createServiceBeneficiaire = async (
  payload: Partial<ServiceBeneficiaire>
): Promise<ServiceBeneficiaire> => {
  console.log("📤 Données envoyées au backend:", payload);
  try {
    const response = await api.post("/serviceBeneficiaire/", payload);
    console.log("✅ Réponse du backend:", response.data);
    return response.data.serviceBeneficiaire || response.data;
  } catch (error: any) {
    console.error("❌ Erreur API createServiceBeneficiare:", error);
    console.error("❌ Détails de l'erreur:", error.response?.data);
    throw error;
  }
};

/**
 * ✅ Mettre à jour un utilisateur (ADMIN) avec photo
 */
export const updateServiceBeneficiaire = async (
  payload: Partial<ServiceBeneficiaire>,
  id: string
): Promise<ServiceBeneficiaire> => {
  const response = await api.put(`/serviceBeneficiaire/${id}`, payload);
  return response.data.serviceBeneficiaire || response.data;
};

export const deleteServiceBeneficiare = async (id: string): Promise<void> => {
  await api.delete(`/serviceBeneficiaire/${id}`);
};
