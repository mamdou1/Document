const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const divisionController = require("../controllers/division.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("division", "create"),
  divisionController.createDivision,
);
// Route pour récupérer les divisions filtrées par service [cite: 2, 4]
router.get(
  "/by-service/:serviceId",
  verifyToken,
  authorizePermission("division", "read"),
  divisionController.getDivisionsByService,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("division", "read"),
  divisionController.getAllDivision,
);

// Route pour récupérer les fonctions d'une division spécifique
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("division", "read"),
  divisionController.getFunctionsByDivision,
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("division", "update"),
  divisionController.updateDivision,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("division", "delete"),
  divisionController.deleteDivision,
);

module.exports = router;
