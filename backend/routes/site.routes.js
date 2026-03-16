const router = require("express").Router();
const ctrl = require("../controllers/site.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("site", "create"),
  ctrl.create,
);
router.get(
  "/",
  verifyToken,
  //authorizePermission("site", "read"),
  ctrl.findAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("site", "read"),
  ctrl.findById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("site", "update"),
  ctrl.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("site", "delete"),
  ctrl.delete,
);

router.get(
  "/:id/salle",
  verifyToken,
  authorizePermission("site", "read"),
  ctrl.getAllSalleBySite,
);

module.exports = router;
