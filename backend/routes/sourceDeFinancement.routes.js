const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  createSourceDeFinancement,
  getSourceDeFinancement,
  getSourceDeFinancementById,
  updateSourceDeFinancement,
  deleteSourceDeFinancement,
} = require("../controllers/SourceDeFinancement.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("sourceDeFinancement", "create"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  createSourceDeFinancement,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("sourceDeFinancement", "read"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  getSourceDeFinancement,
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("sourceDeFinancement", "read"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  getSourceDeFinancementById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("sourceDeFinancement", "update"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  updateSourceDeFinancement,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("sourceDeFinancement", "delete"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  deleteSourceDeFinancement,
);
module.exports = router;
