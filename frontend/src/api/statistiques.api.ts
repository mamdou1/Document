import api from "./axios";

// =============================================
// TOTAUX GLOBAUX
// =============================================

export const getTotalAgents = async () => {
  try {
    const res = await api.get("/statistiques/totaux/agents");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getTotalAgents:", error);
    throw error;
  }
};

export const getTotalTypesDocument = async () => {
  try {
    const res = await api.get("/statistiques/totaux/types-document");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getTotalTypesDocument:", error);
    throw error;
  }
};

export const getTotalDocuments = async () => {
  try {
    const res = await api.get("/statistiques/totaux/documents");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getTotalDocuments:", error);
    throw error;
  }
};

// =============================================
// AGENTS PAR STRUCTURE
// =============================================

export const getAgentsByEntiteeUn = async () => {
  try {
    const res = await api.get("/statistiques/agents/entitee-un");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getAgentsByEntiteeUn:", error);
    throw error;
  }
};

export const getAgentsByEntiteeDeux = async () => {
  try {
    const res = await api.get("/statistiques/agents/entitee-deux");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getAgentsByEntiteeDeux:", error);
    throw error;
  }
};

export const getAgentsByEntiteeTrois = async () => {
  try {
    const res = await api.get("/statistiques/agents/entitee-trois");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getAgentsByEntiteeTrois:", error);
    throw error;
  }
};

export const getAgentsByStructure = async () => {
  try {
    const res = await api.get("/statistiques/agents/structure");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getAgentsByStructure:", error);
    throw error;
  }
};

// =============================================
// DOCUMENTS
// =============================================

export const getDocumentsByType = async () => {
  try {
    const res = await api.get("/statistiques/documents/type");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getDocumentsByType:", error);
    throw error;
  }
};

export const getDocumentsByMonth = async () => {
  try {
    const res = await api.get("/statistiques/documents/mois");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getDocumentsByMonth:", error);
    throw error;
  }
};

export const getDocumentsByStructure = async () => {
  try {
    const res = await api.get("/statistiques/documents/structure");
    return res.data;
  } catch (error) {
    console.error("❌ Erreur getDocumentsByStructure:", error);
    throw error;
  }
};
