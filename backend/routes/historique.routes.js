const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const HistoriqueController = require("../controllers/historique.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.get(
  "/",
  verifyToken,
  authorizePermission("historique", "read"),
  HistoriqueController.list,
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("historique", "read"),
  HistoriqueController.detail,
);

module.exports = router;
