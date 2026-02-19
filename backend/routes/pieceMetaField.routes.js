const router = require("express").Router();
const ctrl = require("../controllers/pieceMetaField.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/pieces/:pieceId/meta-fields",
  verifyToken,
  authorizePermission("pieces", "create"),
  ctrl.create,
);

router.put(
  "/pieces/meta-fields/:id",
  verifyToken,
  authorizePermission("pieces", "update"),
  ctrl.update,
);

router.delete(
  "/pieces/meta-fields/:id",
  verifyToken,
  authorizePermission("pieces", "delete"),
  ctrl.delete,
);

router.get(
  "/pieces/:pieceId/meta-fields",
  verifyToken,
  authorizePermission("pieces", "read"),
  ctrl.getByPiece,
);

module.exports = router;
