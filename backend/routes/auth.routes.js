const express = require("express");
// const { verifyToken } = require("../middlewares/auth.middleware");
const {
  connexion,
  deconnexion,
  refresh,
  forgotPassword,
  verifyAndReset,
  updatePassword,
  inscription,
  changerPassword,
  createGymWithAdmin,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
//const {authorizeRoles} = require("../middlewares/role.middleware")

const router = express.Router();

router.post("/inscription", inscription);
//router.post("/", createGymWithAdmin);
router.post("/connexion", connexion);
router.post("/deconnexion", verifyToken, deconnexion);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-password", verifyToken, verifyAndReset);
router.post("/change-forgot-password", verifyToken, updatePassword);
router.post("/change-password", changerPassword);
router.get("/me", verifyToken);
module.exports = router;
