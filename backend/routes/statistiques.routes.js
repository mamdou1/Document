const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  // Totaux
  getTotalAgents,
  getTotalTypesDocument,
  getTotalDocuments,

  // Agents par structure
  getAgentsByEntiteeUn,
  getAgentsByEntiteeDeux,
  getAgentsByEntiteeTrois,
  getAgentsByStructure,

  // Documents
  getDocumentsByType,
  getDocumentsByMonth,
  getDocumentsByStructure,
} = require("../controllers/statistiques.controller");

// =============================================
// TOTAUX GLOBAUX
// =============================================
router.get(
  "/totaux/agents",
  verifyToken,
  authorizePermission("statistique", "read"),
  getTotalAgents,
);

router.get(
  "/totaux/types-document",
  verifyToken,
  authorizePermission("statistique", "read"),
  getTotalTypesDocument,
);

router.get(
  "/totaux/documents",
  verifyToken,
  authorizePermission("statistique", "read"),
  getTotalDocuments,
);

// =============================================
// AGENTS PAR STRUCTURE
// =============================================
router.get(
  "/agents/entitee-un",
  verifyToken,
  authorizePermission("statistique", "read"),
  getAgentsByEntiteeUn,
);

router.get(
  "/agents/entitee-deux",
  verifyToken,
  authorizePermission("statistique", "read"),
  getAgentsByEntiteeDeux,
);

router.get(
  "/agents/entitee-trois",
  verifyToken,
  authorizePermission("statistique", "read"),
  getAgentsByEntiteeTrois,
);

router.get(
  "/agents/structure",
  verifyToken,
  authorizePermission("statistique", "read"),
  getAgentsByStructure,
);

// =============================================
// DOCUMENTS
// =============================================
router.get(
  "/documents/type",
  verifyToken,
  authorizePermission("statistique", "read"),
  getDocumentsByType,
);

router.get(
  "/documents/mois",
  verifyToken,
  authorizePermission("statistique", "read"),
  getDocumentsByMonth,
);

router.get(
  "/documents/structure",
  verifyToken,
  authorizePermission("statistique", "read"),
  getDocumentsByStructure,
);

module.exports = router;
