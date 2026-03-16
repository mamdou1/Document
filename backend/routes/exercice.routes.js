const express = require("express");
const router = express.Router();
const controller = require("../controllers/exercice.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

// CRUD
router.post(
  "/",
  verifyToken,
  authorizePermission("exercice", "create"),
  controller.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("exercice", "read"),
  controller.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("exercice", "creareadte"),
  controller.getOne,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("exercice", "update"),
  controller.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("exercice", "delete"),
  controller.delete,
);

module.exports = router;
