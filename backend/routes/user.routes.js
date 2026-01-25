const express = require("express");
const router = express.Router();
//const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  createUser,
  getUsers,
  getUsersById,
  updateUserByAdmin,
  updateUserProfil,
  countMembres,
  getMe,
  deleteMembre,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("agent", "create"),
  //authorizeRoles("ADMIN"),
  upload.single("photoProfil"),
  createUser,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("agent", "read"),
  //authorizeRoles("ADMIN", "RECEPTIONNISTE"),
  getUsers,
);
router.get(
  "/totalMembre",
  verifyToken,
  authorizePermission("exercice", "read"),
  //authorizeRoles("ADMIN"),
  countMembres,
);
router.get("/me", verifyToken, getMe);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("agent", "read"),
  getUsersById,
);
router.put(
  "/update-by-admin/:id",
  verifyToken,
  authorizePermission("agent", "update"),
  upload.single("photoProfil"),
  updateUserByAdmin,
);
router.put(
  "/update-profil/:id",
  verifyToken,
  upload.single("photoProfil"),
  updateUserProfil,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("agent", "delete"),
  //authorizeRoles("ADMIN"),
  deleteMembre,
);

// Déconnexion
//router.post("/logout", verifyToken, userController.logout);

module.exports = router;
