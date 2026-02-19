const express = require("express");
const router = express.Router();
const controller = require("../controllers/permission.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.get(
  "/",
  verifyToken,
  //authorizeRoles("ADMIN"),
  authorizePermission("droit", "read"),
  controller.getAllPermissions,
);

module.exports = router;
