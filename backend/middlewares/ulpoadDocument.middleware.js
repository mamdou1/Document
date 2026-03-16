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
const {
  Document,
  Pieces,
  TypeDocument,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} = require("../models");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { documentId, pieceId } = req.params;
      const { upload_mode, piece_value_id } = req.body;

      // 1. Récupérer le document
      const document = await Document.findByPk(documentId);
      if (!document) {
        return cb(new Error("Document introuvable"));
      }

      // 2. Récupérer le type de document
      const typeDocument = await TypeDocument.findByPk(
        document.type_document_id,
      );
      if (!typeDocument) {
        return cb(new Error("Type de document introuvable"));
      }

      // 3. Récupérer les entités (déterminer laquelle est réellement utilisée)
      let entiteeConcernee = null;
      let titre = null;
      let libelle = null;

      // Priorité à la plus petite entité (entiteeTrois > entiteeDeux > entiteeUn)
      if (typeDocument.entitee_trois_id) {
        entiteeConcernee = await EntiteeTrois.findByPk(
          typeDocument.entitee_trois_id,
        );
        titre = entiteeConcernee?.titre; // "Département", "Section", etc.
        libelle = entiteeConcernee?.libelle; // "Département Informatique"
        console.log("📁 Entité concernée: ENTITEE_TROIS");
      } else if (typeDocument.entitee_deux_id) {
        entiteeConcernee = await EntiteeDeux.findByPk(
          typeDocument.entitee_deux_id,
        );
        titre = entiteeConcernee?.titre; // "Sous-direction", "Division", etc.
        libelle = entiteeConcernee?.libelle; // "Sous-direction Finance"
        console.log("📁 Entité concernée: ENTITEE_DEUX");
      } else if (typeDocument.entitee_un_id) {
        entiteeConcernee = await EntiteeUn.findByPk(typeDocument.entitee_un_id);
        titre = entiteeConcernee?.titre; // "Direction"
        libelle = entiteeConcernee?.libelle; // "Direction Administrative"
        console.log("📁 Entité concernée: ENTITEE_UN");
      }

      // Valeurs par défaut si aucune entité trouvée
      titre = titre || "ENTITEE_INCONNUE";
      libelle = libelle || "LIBELLE_INCONNU";
      const typeDocLibelle = typeDocument.nom || "TYPE_INCONNU";

      console.log("📁 Titre:", titre);
      console.log("📁 Libellé entité:", libelle);
      console.log("📁 Type document:", typeDocLibelle);

      // 4. Récupérer le libellé de la pièce si pieceId est fourni
      let pieceLibelle = "PIECE_INCONNUE";
      if (pieceId) {
        const piece = await Pieces.findByPk(pieceId);
        if (piece) {
          pieceLibelle = piece.libelle
            .replace(/[^a-zA-Z0-9\s-]/g, "")
            .replace(/\s+/g, "_")
            .toUpperCase()
            .substring(0, 50);
        }
      }

      // 5. Construire le chemin selon l'arborescence souhaitée :
      // fichiers -> [TITRE_ENTITE] -> [LIBELLE_ENTITE] -> [NOM_TYPE_DOCUMENT] -> DOC-[documentId]
      let uploadDir = path.join(
        process.cwd(),
        "uploads",
        "fichiers",
        titre, // "Département", "Section", "Direction"
        libelle, // "Département Informatique", "Section Juridique"
        typeDocLibelle, // "Rapport d'activité", "PV", "Bon d'achat"
        `DOC-${documentId}`, // "DOC-29"
      );

      // MODE LOT UNIQUE
      if (upload_mode === "LOT_UNIQUE") {
        uploadDir = path.join(uploadDir, "LOT_UNIQUE");
      }
      // MODE INDIVIDUEL
      else {
        if (piece_value_id) {
          uploadDir = path.join(
            uploadDir,
            "PIECES",
            pieceLibelle,
            `META-${piece_value_id}`,
          );
        } else if (pieceId) {
          uploadDir = path.join(uploadDir, "PIECES", pieceLibelle);
        } else {
          uploadDir = path.join(uploadDir, "PIECES", "AUTRES");
        }
      }

      // 6. Créer le dossier
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("✅ Dossier créé:", uploadDir);

      cb(null, uploadDir);
    } catch (err) {
      console.error("❌ Erreur dans destination multer:", err);
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    const date = new Date().toISOString().split("T")[0];
    const unique = Date.now();
    const ext = path.extname(file.originalname);

    const originalName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "_")
      .substring(0, 30);

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
