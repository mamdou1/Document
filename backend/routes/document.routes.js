const router = require("express").Router();
const ctrl = require("../controllers/document.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("document", "create"),
  ctrl.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("document", "update"),
  ctrl.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("document", "delete"),
  ctrl.remove,
);

const upload = require("../middlewares/ulpoadDocument.middleware");
router.post(
  "/:documentId/files",
  verifyToken,
  authorizePermission("document", "create"),
  upload.array("files", 10),
  ctrl.uploadDocumentFiles,
);
router.get(
  "/:documentId/files",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getDocumentFiles,
);

module.exports = router;
