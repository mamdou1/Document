const express = require("express");
const router = express.Router();
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  createPieces,
  getPieces,
  updatePieces,
  deletePiece,
} = require("../controllers/Pieces.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("pieces", "create"),
  //authorizeRoles("ADMIN", "MEMBRE_AUTHORIZE"),
  createPieces,
);
router.get(
  "/",
  verifyToken,
  //authorizePermission("pieces", "read"),
  //authorizeRoles("ADMIN", "MEMBRE_AUTHORIZE"),
  getPieces,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("pieces", "update"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  updatePieces,
);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("pieces", "delete"),
  deletePiece,
);

module.exports = router;
