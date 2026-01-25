const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const fonctionController = require("../controllers/fonction.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("fonction", "create"),
  fonctionController.createFonction,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("fonction", "read"),
  fonctionController.getAllFonctions,
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("fonction", "update"),
  fonctionController.updateFonctions,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("fonction", "delete"),
  fonctionController.deleteFonction,
);

module.exports = router;
