const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const entiteeDeuxController = require("../controllers/entiteeDeux.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("entiteeDeux", "create"),
  entiteeDeuxController.createEntiteeDeux,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getAllEntiteeDeux,
);
router.get(
  "/by-entiteeUn/:entiteeUnId",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getEntiteeDeuxByEntiteeUn,
);

// ✅ DÉPLACER ICI
router.get(
  "/titre",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getEntiteeDeuxTitre,
);
// router.post(
//   "/titre",
//   verifyToken,
//   authorizePermission("section", "create"),
//   entiteeDeuxController.createEntiteeDeuxTitre,
// );
router.put(
  "/titre",
  verifyToken,
  authorizePermission("entiteeDeux", "update"),
  entiteeDeuxController.updateEntiteeDeuxTitre,
);

// ❌ APRÈS
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getFunctionsByEntiteeDeux,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("entiteeDeux", "update"),
  entiteeDeuxController.updateEntiteeDeux,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("entiteeDeux", "delete"),
  entiteeDeuxController.deleteEntiteeDeux,
);

module.exports = router;
