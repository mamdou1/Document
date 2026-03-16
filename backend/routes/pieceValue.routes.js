// routes/pieceValue.routes.js
const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  getPieceValuesByDocument,
  getPieceValuesByPiece,
  createPieceValue,
  updatePieceValue,
  deletePieceValue,
} = require("../controllers/pieceValue.controller");

// Récupérer toutes les valeurs pour un document
router.get(
  "/documents/:documentId/piece-values",
  verifyToken,
  authorizePermission("document", "read"),
  getPieceValuesByDocument,
);

// Récupérer les valeurs pour une pièce spécifique
router.get(
  "/documents/:documentId/pieces/:pieceId/values",
  verifyToken,
  authorizePermission("document", "read"),
  getPieceValuesByPiece,
);

// Créer une nouvelle valeur
router.post(
  "/documents/:documentId/piece-values",
  verifyToken,
  authorizePermission("document", "create"),
  createPieceValue,
);

// Mettre à jour une valeur
router.put(
  "/piece-values/:id",
  verifyToken,
  authorizePermission("document", "update"),
  updatePieceValue,
);

// Supprimer une valeur
router.delete(
  "/piece-values/:id",
  verifyToken,
  authorizePermission("document", "delete"),
  deletePieceValue,
);

module.exports = router;
