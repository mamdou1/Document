const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/sync.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/documents/:id/sync",
  verifyToken,
  authorizePermission("document", "create"), // ou update selon ton système
  ctrl.syncFullDocumentFromDGCC,
);
router.post(
  "/documents/sync",
  verifyToken,
  authorizePermission("document", "create"), // ou update selon ton système
  ctrl.syncAllDocumentsFromDGCC,
);

// router.post("/pieces-dgcc", async (req, res) => {
//   await ctrl.syncPiecesFormDGCC();

//   res.json({
//     message: "Synchronisation DGCC terminé",
//   });
// });

router.post(
  "/pieces-dgcc",
  verifyToken,
  authorizePermission("pieces", "create"),
  ctrl.syncPiecesFormDGCC,
);

module.exports = router;
