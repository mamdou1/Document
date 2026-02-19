// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const { Document } = require("../models"); // ✅ Importez Document, pas Liquidation

// const storage = multer.diskStorage({
//   destination: async (req, file, cb) => {
//     try {
//       const { documentId } = req.params;
//       const { upload_mode } = req.body;

//       const document = await Document.findByPk(documentId);

//       if (!document) {
//         return cb(new Error("Document introuvable"));
//       }

//       // Chemin de base pour le document
//       let uploadDir = path.join(
//         process.cwd(),
//         "uploads",
//         "documents",
//         `DOC-${documentId}`,
//       );

//       // MODE LOT UNIQUE
//       if (upload_mode === "LOT_UNIQUE") {
//         uploadDir = path.join(uploadDir, "LOT_UNIQUE");
//       } else {
//         // MODE INDIVIDUEL - dossier par défaut
//         uploadDir = path.join(uploadDir, "PIECES");
//       }

//       // Création récursive du dossier
//       fs.mkdirSync(uploadDir, { recursive: true });

//       cb(null, uploadDir);
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
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB
//   },
// });

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Document, Pieces } = require("../models"); // ✅ IMPORT Pieces aussi

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { documentId, pieceId } = req.params;
      const { upload_mode, piece_value_id } = req.body;

      const document = await Document.findByPk(documentId);

      if (!document) {
        return cb(new Error("Document introuvable"));
      }

      // ✅ Récupérer le libellé de la pièce si pieceId est fourni
      let pieceLibelle = "PIECE_INCONNUE";
      if (pieceId) {
        const piece = await Pieces.findByPk(pieceId);
        if (piece) {
          // Nettoyer le libellé pour en faire un nom de dossier valide
          pieceLibelle = piece.libelle
            .replace(/[^a-zA-Z0-9\s-]/g, "") // Enlever caractères spéciaux
            .replace(/\s+/g, "_") // Remplacer espaces par _
            .toUpperCase()
            .substring(0, 50); // Limiter la longueur
        }
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
      }
      // MODE INDIVIDUEL
      else {
        if (piece_value_id) {
          // ✅ Fichier pour une métadonnée spécifique
          uploadDir = path.join(
            uploadDir,
            "PIECES",
            pieceLibelle, // ✅ LIBELLÉ de la pièce
            `META-${piece_value_id}`,
          );
        } else if (pieceId) {
          // ✅ Fichier pour une pièce sans métadonnée spécifique
          uploadDir = path.join(
            uploadDir,
            "PIECES",
            pieceLibelle, // ✅ LIBELLÉ de la pièce
          );
        } else {
          // Fallback
          uploadDir = path.join(uploadDir, "PIECES", "AUTRES");
        }
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

    // Garder le nom original pour meilleure traçabilité
    const originalName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "_") // Nettoyer les caractères spéciaux
      .substring(0, 30); // Limiter la longueur

    cb(null, `${date}_${unique}_${originalName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    // Accepter PDF, JPEG, PNG
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Type de fichier non autorisé. Seuls PDF, JPEG et PNG sont acceptés.",
        ),
      );
    }
  },
});

module.exports = upload;
