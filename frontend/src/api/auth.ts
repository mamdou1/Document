import api from "./axios";
import {
  ChangePasswordPayload,
  ApiResponse,
  ApiResponses,
  ForgotPasswordPayload,
  VerifyCodePayload,
  UpdatePasswordPayload,
} from "../interfaces";

/**
 * Changer le mot de passe de l'utilisateur connecté
 * @param payload - Contient l'ancien et le nouveau mot de passe
 * @returns Promise avec le message de succès
 */
export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ApiResponse> => {
  try {
    const { data } = await api.post<ApiResponse>(
      "/auth/change-password",
      payload,
    );
    console.log("✅ Mot de passe changé avec succès:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur changement de mot de passe:", error);

    // Gestion des erreurs spécifiques
    if (error.response?.status === 400) {
      throw new Error(
        error.response.data.message || "Ancien mot de passe incorrect",
      );
    }

    if (error.response?.status === 401) {
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }

    if (error.response?.status === 500) {
      throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
    }

    if (error.code === "ERR_NETWORK") {
      throw new Error("Problème de connexion au serveur.");
    }

    throw new Error(
      error.response?.data?.message ||
        "Erreur lors du changement de mot de passe",
    );
  }
};

/**
 * Envoyer un email de réinitialisation
 */
export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<ApiResponses> => {
  try {
    console.log("📤 Envoi demande de réinitialisation pour:", payload.email);
    const { data } = await api.post<ApiResponses>(
      "/auth/forgot-password",
      payload,
    );
    console.log("✅ Réponse reçue:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur forgotPassword:", error);

    if (error.response?.status === 404) {
      throw new Error("Aucun compte trouvé avec cet email");
    }
    if (error.response?.status === 500) {
      throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
    }

    throw new Error(
      error.response?.data?.message || "Erreur lors de l'envoi de l'email",
    );
  }
};

/**
 * Vérifier le code de confirmation
 */
export const verifyResetCode = async (
  payload: VerifyCodePayload,
  token: string,
): Promise<ApiResponses> => {
  try {
    console.log("🔐 Vérification du code avec token");
    const { data } = await api.post<ApiResponses>(
      "/auth/verify-reset-password",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("✅ Code vérifié avec succès");
    return data;
  } catch (error: any) {
    console.error("❌ Erreur verifyResetCode:", error);

    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || "Code invalide ou expiré");
    }
    if (error.response?.status === 401) {
      throw new Error("Session expirée. Veuillez recommencer.");
    }

    throw new Error(error.response?.data?.message || "Erreur de vérification");
  }
};

/**
 * Mettre à jour le mot de passe (après vérification)
 */
export const updateForgotPassword = async (
  payload: UpdatePasswordPayload,
  token: string,
): Promise<ApiResponses> => {
  try {
    console.log("🔑 Mise à jour du mot de passe");
    const { data } = await api.post<ApiResponses>(
      "/auth/change-forgot-password",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("✅ Mot de passe mis à jour");
    return data;
  } catch (error: any) {
    console.error("❌ Erreur updateForgotPassword:", error);

    if (error.response?.status === 403) {
      throw new Error("Session invalide. Veuillez recommencer.");
    }

    throw new Error(
      error.response?.data?.message || "Erreur lors de la mise à jour",
    );
  }
};

/**
 * Vérifier la force du mot de passe
 * @param password - Mot de passe à vérifier
 * @returns true si le mot de passe est assez fort
 */
export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

/**
 * Obtenir la force du mot de passe (pour indicateur visuel)
 * @param password - Mot de passe à évaluer
 * @returns Score de 0 à 4 et message
 */
export const getPasswordStrength = (
  password: string,
): { score: number; message: string; color: string } => {
  if (!password) return { score: 0, message: "Vide", color: "bg-slate-200" };

  let score = 0;

  // Longueur
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Types de caractères
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Normaliser le score (0-4)
  score = Math.min(4, Math.floor(score / 2));

  const strengthMap = [
    { score: 0, message: "Très faible", color: "bg-red-500" },
    { score: 1, message: "Faible", color: "bg-orange-500" },
    { score: 2, message: "Moyen", color: "bg-yellow-500" },
    { score: 3, message: "Fort", color: "bg-emerald-500" },
    { score: 4, message: "Très fort", color: "bg-green-600" },
  ];

  return strengthMap[score];
};
