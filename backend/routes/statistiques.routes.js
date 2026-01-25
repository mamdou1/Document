const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  getTotalByProgramme,
  getTotalByChapitre,
  getTotalByNature,
} = require("../controllers/statistiques.controller");

router.get(
  "/programme",
  verifyToken,
  authorizePermission("statistique", "read"),
  getTotalByProgramme,
);

router.get(
  "/chapitre",
  verifyToken,
  authorizePermission("statistique", "read"),
  getTotalByChapitre,
);
router.get(
  "/nature",
  verifyToken,
  authorizePermission("statistique", "read"),
  getTotalByNature,
);

module.exports = router;
