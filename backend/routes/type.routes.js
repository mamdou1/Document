const express = require("express");
const router = express.Router();
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  createType,
  getType,
  uploadPiecePdf,
  addPiecesToType,
  deleteType,
  getTypeById,
} = require("../controllers/type.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const uploadPdf = require("../middlewares/uploadPdf.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("type", "create"),
  //authorizeRoles("ADMIN", "MEMBRE_AUTHORIZE"),
  createType,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("type", "read"),
  //authorizeRoles("ADMIN", "MEMBRE_AUTHORIZE"),
  getType,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("type", "read"),
  //authorizeRoles("ADMIN", "MEMBRE_AUTHORIZE"),
  getTypeById,
);
router.post(
  "/:id/pieces",
  verifyToken,
  authorizePermission("type", "create"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  addPiecesToType,
);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("type", "delete"),
  deleteType,
);

// router.post(
//   "/:typeId/piece/:pieceId/upload",
//   verifyToken,
//   authorizeRoles("ADMIN", "MEMBRE_AUTHORIZE"),
//   uploadPdf.single("file"),
//   uploadPiecePdf
// );

module.exports = router;
