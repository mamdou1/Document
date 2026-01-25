const express = require("express");
const router = express.Router();
const controller = require("../controllers/nature.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("nature", "create"),
  controller.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("nature", "read"),
  controller.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("nature", "read"),
  controller.getOne,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("nature", "update"),
  controller.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("nature", "delete"),
  controller.delete,
);
router.get(
  "/by-nature/:chapitreId",
  verifyToken,
  authorizePermission("read", "create"),
  controller.getNatureChapitre,
);

module.exports = router;
