const router = require("express").Router();
const ctrl = require("../controllers/salle.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("salle", "create"),
  ctrl.create,
);
router.get(
  "/",
  verifyToken,
  //authorizePermission("salle", "read"),
  ctrl.findAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("salle", "read"),
  ctrl.findById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("salle", "update"),
  ctrl.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("salle", "delete"),
  ctrl.delete,
);

router.get(
  "/:id/rayon",
  verifyToken,
  authorizePermission("salle", "read"),
  ctrl.getAllRayonBySalle,
);

module.exports = router;
