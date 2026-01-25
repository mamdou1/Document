const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const controller = require("../controllers/chapitre.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("chapitre", "create"),
  controller.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("chapitre", "read"),
  controller.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("chapitre", "read"),
  controller.getOne,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("chapitre", "update"),
  controller.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("chapitre", "delete"),
  controller.delete,
);
router.get(
  "/by-programme/:programmeId",
  verifyToken,
  authorizePermission("chapitre", "read"),
  controller.getChapitreByProgramme,
);

module.exports = router;
