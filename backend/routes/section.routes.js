const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/section.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("section", "create"),
  sectionController.createSection,
);
// Route pour récupérer les sections filtrées par division [cite: 2, 4]
router.get(
  "/by-division/:divisionId",
  verifyToken,
  authorizePermission("section", "read"),
  sectionController.getSectionsByDivision,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("section", "read"),
  sectionController.getAllSection,
);

// Route pour récupérer les fonctions d'une section spécifique
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("section", "read"),
  sectionController.getFunctionsBySection,
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("section", "update"),
  sectionController.updateSection,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("section", "delete"),
  sectionController.deleteSection,
);

module.exports = router;
