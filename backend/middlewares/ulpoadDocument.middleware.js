// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const { Document } = require("../models");

// const storage = multer.diskStorage({
//   destination: async (req, file, cb) => {
//     try {
//       const { documentId } = req.params;

//       const document = await Document.findByPk(documentId);

//       if (!document) {
//         return cb(new Error("Document introuvable"));
//       }

//       const dir = path.join("uploads", "Documents", `DOC-${documentId}`);

//       fs.mkdirSync(dir, { recursive: true });
//       cb(null, dir);
//     } catch (err) {
//       cb(err);
//     }
//   },

//   filename: (req, file, cb) => {
//     const date = new Date().toISOString().split("T")[0];
//     const unique = Date.now();
//     const ext = path.extname(file.originalname);

//     cb(null, `${date}_${unique}${ext}`);
//   },
// });

// module.exports = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Document } = require("../models"); // ✅ Importez Document, pas Liquidation

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { documentId } = req.params;
      const { upload_mode } = req.body;

      const document = await Document.findByPk(documentId);

      if (!document) {
        return cb(new Error("Document introuvable"));
      }

      // Chemin de base pour le document
      let uploadDir = path.join(
        process.cwd(),
        "uploads",
        "documents",
        `DOC-${documentId}`,
      );

      // MODE LOT UNIQUE
      if (upload_mode === "LOT_UNIQUE") {
        uploadDir = path.join(uploadDir, "LOT_UNIQUE");
      } else {
        // MODE INDIVIDUEL - dossier par défaut
        uploadDir = path.join(uploadDir, "PIECES");
      }

      // Création récursive du dossier
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
