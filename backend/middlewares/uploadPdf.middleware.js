const multer = require("multer");
const fs = require("fs");
const path = require("path");
const slugify = require("../utils/slugify");
const { Liquidation, Pieces } = require("../models");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { liquidationId, pieceId } = req.params;

      const liquidation = await Liquidation.findByPk(liquidationId);
      const piece = await Pieces.findByPk(pieceId);

      if (!liquidation || !piece) {
        return cb(new Error("Liquidation ou pièce introuvable"));
      }

      const pieceFolder = slugify(piece.libelle);

      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "liquidations",
        `LIQ-${liquidationId}`,
        pieceFolder,
      );

      fs.mkdirSync(uploadDir, { recursive: true });

      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    const date = new Date().toISOString().split("T")[0];
    const unique = Date.now();
    const ext = path.extname(file.originalname);

    cb(null, `${date}_${unique}${ext}`);
  },
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
