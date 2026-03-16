const express = require("express");
const router = express.Router();
const controller = require("../controllers/droitPermission.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.get(
  "/:id/permissions",
  verifyToken,
  authorizePermission("droit", "read"),
  controller.getLibellePermission,
);

router.put(
  "/:id/permissions",
  verifyToken,
  authorizePermission("droit", "update"),
  controller.updateLibellePermission,
);

module.exports = router;
