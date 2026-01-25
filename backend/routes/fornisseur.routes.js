const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  createFournisseur,
  getFournisseur,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur,
} = require("../controllers/fournisseur.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("fournisseur", "create"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  createFournisseur,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("fournisseur", "read"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  getFournisseur,
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("fournisseur", "read"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  getFournisseurById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("fournisseur", "update"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  updateFournisseur,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("fournisseur", "delete"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  deleteFournisseur,
);
module.exports = router;
