const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const controller = require("../controllers/droit.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

// CRUD
router.post(
  "/",
  verifyToken,
  authorizePermission("droit", "create"),
  controller.create,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("droit", "read"),
  controller.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("droit", "read"),
  controller.getOne,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("droit", "update"),
  controller.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("droit", "delete"),
  controller.delete,
);

router.get(
  "/:id/agents",
  verifyToken,
  authorizePermission("droit", "delete"),
  controller.getAgentByDroit,
);

module.exports = router;
