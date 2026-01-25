const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("service", "create"),
  serviceController.createService,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("service", "read"),
  serviceController.getAllServices,
);
// Route pour récupérer les fonctions d'un service spécifique
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("service", "read"),
  serviceController.getFunctionsByService,
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("service", "update"),
  serviceController.updateService,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("service", "delete"),
  serviceController.deleteService,
);

module.exports = router;
