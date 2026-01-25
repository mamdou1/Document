const express = require("express");
const router = express.Router();
const controller = require("../controllers/programme.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("programme", "create"),
  controller.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("programme", "read"),
  controller.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("programme", "read"),
  controller.getOne,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("programme", "update"),
  controller.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("programme", "delete"),
  controller.delete,
);

module.exports = router;
