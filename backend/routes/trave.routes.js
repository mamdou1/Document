const router = require("express").Router();
const ctrl = require("../controllers/trave.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  authorizePermission("trave", "create"),
  verifyToken,
  ctrl.create,
);
router.get(
  "/",
  verifyToken,
  //authorizePermission("trave", "read"),
  ctrl.findAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("trave", "read"),
  ctrl.findById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("trave", "update"),
  ctrl.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("trave", "delete"),
  ctrl.delete,
);

router.get(
  "/:id/box",
  verifyToken,
  authorizePermission("trave", "read"),
  ctrl.getAllBoxByTrave,
);

module.exports = router;
