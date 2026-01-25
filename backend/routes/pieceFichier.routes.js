const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadPieceFiles");
const controller = require("../controllers/pieceFichier.controller");

router.post(
  "/liquidation/:liquidationId/type/:typeId/piece/:pieceId/files",
  upload.array("files", 10),
  controller.uploadMultipleFiles
);

router.get("/type/:typeId/piece/:pieceId/files", controller.getFilesByPiece);

module.exports = router;
