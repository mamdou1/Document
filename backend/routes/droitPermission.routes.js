const express = require("express");
const router = express.Router();
const controller = require("../controllers/droitPermission.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get(
  "/:id/permissions",
  verifyToken,
  authorizeRoles("ADMIN"),
  controller.getLibellePermission
);

router.put(
  "/:id/permissions",
  verifyToken,
  authorizeRoles("ADMIN"),
  controller.updateLibellePermission
);

module.exports = router;

