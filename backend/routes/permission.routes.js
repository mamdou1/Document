const express = require("express");
const router = express.Router();
const controller = require("../controllers/permission.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.get(
  "/",
  verifyToken,
  authorizePermission("droit", "read"),
  controller.getAllPermissions,
);

module.exports = router;
