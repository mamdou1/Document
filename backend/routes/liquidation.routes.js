const express = require("express");
const router = express.Router();
const controller = require("../controllers/liquidation.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("liquidation", "create"),
  controller.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("liquidation", "read"),
  controller.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("liquidation", "read"),
  controller.getOne,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("liquidation", "update"),
  controller.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("liquidation", "delete"),
  controller.delete,
);

// config multer
const upload = require("../middlewares/uploadPdf.middleware");

// router.post(
//   "/:liquidationId/pieces/:pieceId/upload",

//   verifyToken,
//   upload.single("file"),
//   controller.uploadPiece
// );
// router.patch(
//   "/:liquidationId/pieces/:pieceId/disponible",
//   controller.updatePieceDisponibilite
// );

router.patch(
  "/:liquidationId/pieces/:pieceId/disponible",
  controller.updatePieceDisponibilite,
);

router.post(
  "/:liquidationId/type/:typeId/piece/:pieceId/files",
  upload.array("files", 10),
  controller.uploadPieceFiles,
);

router.get("/:liquidationId/piece/:pieceId/files", controller.getPieceFiles);

router.get(
  "/liquidations/:liquidationId/pieces",
  verifyToken,
  controller.getLiquidationPieces,
);

module.exports = router;
