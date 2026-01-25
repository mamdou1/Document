const express = require("express");
const router = express.Router();
const controller = require("../controllers/permission.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  controller.getAllPermissions
);

module.exports = router;
