const {
  Document,
  DocumentValue,
  MetaField,
  DocumentFile,
  TypeDocument,
  TypeDocumentPieces,
  DocumentFichier,
  DocumentPieces,
  Pieces,
  sequelize,
  PieceValue,
} = require("../models");
const buildAccessWhere = require("../utils/buildAccessWhere.utils");

// exports.create = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { type_document_id, values } = req.body;

//     if (!type_document_id) {
//       return res
//         .status(400)
//         .json({ message: "Le type de document est requis" });
//     }

//     // 1. Créer le document
//     const doc = await Document.create({ type_document_id }, { transaction: t });

//     const typeDocumentPieces =
//       await sequelize.models.TypeDocumentPieces.findAll({
//         where: { document_type_id: type_document_id },
//         transaction: t,
//       });

//     if (typeDocumentPieces.length > 0) {
//       console.log(
//         "📋 Détail des pièces:",
//         typeDocumentPieces.map((p) => ({
//           id: p.id,
//           piece_id: p.piece_id,
//           document_type_id: p.document_type_id,
//         })),
//       );

//       const pieceRows = typeDocumentPieces.map((tp) => ({
//         document_id: doc.id,
//         piece_id: tp.piece_id,
//         disponible: false,
//       }));

//       await DocumentPieces.bulkCreate(pieceRows, { transaction: t });
//     } else {
//       // Vérifier si le type de document existe
//       const typeDoc = await sequelize.models.TypeDocument.findByPk(
//         type_document_id,
//         { transaction: t },
//       );
//       console.log(
//         `ℹ️ Type de document ${type_document_id}: ${typeDoc ? typeDoc.nom : "NON TROUVÉ !"}`,
//       );
//     }

//     // 3. Meta values
//     if (values && Object.keys(values).length > 0) {
//       const metaRows = Object.entries(values).map(([meta_field_id, value]) => ({
//         document_id: doc.id,
//         meta_field_id: parseInt(meta_field_id),
//         value: value.toString(),
//       }));
//       await DocumentValue.bulkCreate(metaRows, { transaction: t });
//       console.log(`✅ ${metaRows.length} valeurs meta insérées`);
//     }

//     await t.commit();

//     res.status(201).json({
//       message: "Document créé avec succès",
//       id: doc.id,
//       type_document_id: doc.type_document_id,
//       pieces_count: typeDocumentPieces.length,
//     });
//   } catch (e) {
//     if (t) await t.rollback();
//     res.status(500).json({
//       message: "Erreur lors de la création du document",
//       error: e.message,
//     });
//   }
// };

// Dans document.controller.js - modifier la fonction create
exports.create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { type_document_id, values, piece_values } = req.body;

    if (!type_document_id) {
      return res
        .status(400)
        .json({ message: "Le type de document est requis" });
    }

    // 1. Créer le document
    const doc = await Document.create({ type_document_id }, { transaction: t });

    // 2. Associer les pièces du type
    const typeDocumentPieces = await TypeDocumentPieces.findAll({
      where: { document_type_id: type_document_id },
      transaction: t,
    });

    if (typeDocumentPieces.length > 0) {
      const pieceRows = typeDocumentPieces.map((tp) => ({
        document_id: doc.id,
        piece_id: tp.piece_id,
        disponible: false,
      }));
      await DocumentPieces.bulkCreate(pieceRows, { transaction: t });
    }

    // 3. Meta values du document
    if (values && Object.keys(values).length > 0) {
      const metaRows = Object.entries(values).map(([meta_field_id, value]) => ({
        document_id: doc.id,
        meta_field_id: parseInt(meta_field_id),
        value: value.toString(),
      }));
      await DocumentValue.bulkCreate(metaRows, { transaction: t });
    }

    // 4. Valeurs des métadonnées des pièces
    if (piece_values && Object.keys(piece_values).length > 0) {
      const pieceValueRows = [];

      for (const [pieceId, metaFields] of Object.entries(piece_values)) {
        for (const [metaFieldId, value] of Object.entries(metaFields)) {
          pieceValueRows.push({
            document_id: doc.id,
            piece_id: parseInt(pieceId),
            piece_meta_field_id: parseInt(metaFieldId),
            value: value?.toString() || null,
          });
        }
      }

      if (pieceValueRows.length > 0) {
        await PieceValue.bulkCreate(pieceValueRows, {
          // ✅ Correction ici
          transaction: t,
        });
      }
    }

    await t.commit();

    res.status(201).json({
      message: "Document créé avec succès",
      id: doc.id,
      type_document_id: doc.type_document_id,
    });
  } catch (e) {
    if (t) await t.rollback();
    console.error("❌ Erreur create document:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Document.findAll({
      include: [
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
        },
        {
          model: TypeDocument,
          as: "typeDocument",
          include: [{ model: MetaField, as: "metaFields" }],
        },
        {
          model: DocumentValue,
          as: "values",
          include: [
            { model: MetaField, as: "metaField" },
            { model: DocumentFile, as: "file" },
          ],
        },
      ],
    });

    res.json(data);
  } catch (e) {
    console.error("❌ Erreur getAll documents:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Document.findByPk(req.params.id, {
      include: [
        {
          model: TypeDocument,
          include: [MetaField],
        },
        {
          model: DocumentValue,
          include: [MetaField, DocumentFile],
        },
      ],
    });

    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Dans document.controller.js, au début de getAll
// exports.getAll = async (req, res) => {
//   try {
//     console.log("🔍 Début de getAll documents");

//     // Log 1: Vérifier les modèles disponibles
//     console.log("📦 Modèles disponibles:", Object.keys(sequelize.models));

//     // Log 2: Vérifier les associations de Document
//     console.log(
//       "🔗 Associations de Document:",
//       Object.keys(Document.associations),
//     );

//     // Log 3: Tenter la requête étape par étape
//     console.log("📝 Exécution de Document.findAll...");

//     const data = await Document.findAll({
//       include: [
//         {
//           model: Pieces,
//           as: "pieces",
//           attributes: ["id", "libelle", "code_pieces"],
//         },
//         {
//           model: TypeDocument,
//           as: "typeDocument",
//           include: [{ model: MetaField, as: "metaFields" }],
//         },
//         {
//           model: DocumentValue,
//           as: "values",
//           include: [
//             { model: MetaField, as: "metaField" },
//             { model: DocumentFile, as: "file" },
//           ],
//         },
//       ],
//     });

//     console.log(`✅ ${data.length} documents trouvés`);

//     // Log 4: Aperçu du premier document
//     if (data.length > 0) {
//       console.log("📄 Premier document:", {
//         id: data[0].id,
//         typeDocument: data[0].typeDocument?.nom,
//         piecesCount: data[0].pieces?.length,
//         valuesCount: data[0].values?.length,
//       });
//     }

//     res.json(data);
//   } catch (e) {
//     console.error("❌ Erreur détaillée getAll documents:");
//     console.error("   Message:", e.message);
//     console.error("   Name:", e.name);
//     console.error("   Stack:", e.stack);

//     // Log 5: Si c'est une erreur d'association, montrer plus de détails
//     if (e.name === "SequelizeEagerLoadingError") {
//       console.error("   Cause probable: Association manquante ou incorrecte");

//       // Vérifier les associations de tous les modèles impliqués
//       console.log("🔍 Vérification des associations:");
//       console.log(
//         "   Pieces associations:",
//         Object.keys(Pieces.associations || {}),
//       );
//       console.log(
//         "   TypeDocument associations:",
//         Object.keys(TypeDocument.associations || {}),
//       );
//       console.log(
//         "   DocumentValue associations:",
//         Object.keys(DocumentValue.associations || {}),
//       );
//       console.log(
//         "   MetaField associations:",
//         Object.keys(MetaField.associations || {}),
//       );
//       console.log(
//         "   DocumentFile associations:",
//         Object.keys(DocumentFile.associations || {}),
//       );
//     }

//     res.status(500).json({
//       message: e.message,
//       error: e.toString(),
//     });
//   }
// };

exports.getById = async (req, res) => {
  try {
    const data = await Document.findByPk(req.params.id, {
      include: [
        {
          model: TypeDocument,
          as: "typeDocument",
          include: [{ model: MetaField, as: "metaFields" }],
        },
        {
          model: DocumentValue,
          as: "values",
          include: [
            { model: MetaField, as: "metaField" },
            { model: DocumentFile, as: "file" },
          ],
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: {
            model: DocumentPieces,
            attributes: ["disponible"],
          },
        },
      ],
    });

    if (!data) return res.status(404).json({ message: "Not found" });

    // ⚠️ NE PAS formater ici - renvoyez les données brutes d'abord
    res.json(data);
  } catch (e) {
    console.error("❌ Erreur getById:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { values } = req.body;

    for (const v of values) {
      await DocumentValue.update({ value: v.value }, { where: { id: v.id } });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Document.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// exports.uploadDocumentFiles = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { documentId, pieceId, documentTypeId } = req.params;
//     const { upload_mode } = req.body;
//     const files = req.files;

//     console.log("📝 UPLOAD DOCUMENT - Params:", {
//       documentId,
//       pieceId,
//       documentTypeId,
//     });
//     console.log("📝 UPLOAD DOCUMENT - Mode:", upload_mode);
//     console.log("📝 UPLOAD DOCUMENT - Fichiers:", files?.length || 0);

//     if (!files || files.length === 0) {
//       await t.rollback();
//       return res.status(400).json({ message: "Aucun fichier uploadé" });
//     }

//     // ==================== MODE LOT UNIQUE ====================
//     if (upload_mode === "LOT_UNIQUE") {
//       console.log("📦 Traitement en mode LOT_UNIQUE");

//       for (const file of files) {
//         const publicPath = file.path
//           .replace(/\\/g, "/")
//           .replace(/^.*uploads\//, "uploads/");

//         console.log("📁 Fichier enregistré:", publicPath);

//         await DocumentFichier.create(
//           {
//             document_id: documentId,
//             piece_id: null, // LOT_UNIQUE n'est pas lié à une pièce spécifique
//             fichier: publicPath,
//             original_name: file.originalname,
//             mode: "LOT_UNIQUE",
//           },
//           { transaction: t },
//         );
//       }

//       await t.commit();

//       return res.json({
//         message: "Dossier complet uploadé avec succès",
//         mode: "LOT_UNIQUE",
//         fichiers_count: files.length,
//       });
//     }

//     // ==================== MODE INDIVIDUEL (par défaut) ====================
//     if (!pieceId || pieceId === "undefined" || pieceId === "null") {
//       await t.rollback();
//       return res.status(400).json({
//         message: "ID de pièce requis pour le mode INDIVIDUEL",
//       });
//     }

//     console.log("📄 Traitement en mode INDIVIDUEL pour pièce:", pieceId);

//     // Vérifier que la pièce est autorisée pour ce type de document
//     const relation = await TypeDocumentPieces.findOne({
//       where: {
//         document_type_id: documentTypeId,
//         piece_id: pieceId,
//       },
//       transaction: t,
//     });

//     if (!relation) {
//       await t.rollback();
//       return res.status(403).json({
//         message: "Pièce non autorisée pour ce type de document",
//       });
//     }

//     // Vérifier que le document existe et que la pièce est disponible
//     const docPiece = await DocumentPieces.findOne({
//       where: {
//         document_id: documentId,
//         piece_id: pieceId,
//       },
//       transaction: t,
//     });

//     if (!docPiece) {
//       console.log(
//         `⚠️ DocumentPieces non trouvé pour document ${documentId}, pièce ${pieceId}`,
//       );
//       // On peut créer l'association si elle n'existe pas
//       await DocumentPieces.create(
//         {
//           document_id: documentId,
//           piece_id: pieceId,
//           disponible: true,
//         },
//         { transaction: t },
//       );
//     }

//     // Enregistrer les fichiers
//     const records = [];

//     for (const file of files) {
//       const publicPath = file.path
//         .replace(/\\/g, "/")
//         .replace(/^.*uploads\//, "uploads/");

//       console.log("📁 Fichier enregistré:", publicPath);

//       const docFichier = await DocumentFichier.create(
//         {
//           document_id: documentId,
//           piece_id: pieceId,
//           fichier: publicPath,
//           original_name: file.originalname,
//           mode: "INDIVIDUEL",
//         },
//         { transaction: t },
//       );

//       records.push(docFichier);
//     }

//     await t.commit();

//     res.json({
//       message: "Fichiers ajoutés avec succès",
//       mode: "INDIVIDUEL",
//       fichiers: records,
//       count: records.length,
//     });
//   } catch (err) {
//     await t.rollback();
//     console.error("❌ Erreur uploadDocumentFiles:", err);
//     res.status(500).json({
//       message: "Erreur lors de l'upload des fichiers",
//       error: err.message,
//     });
//   }
// };

// Dans document.controller.js - modifier uploadDocumentFiles
exports.uploadDocumentFiles = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { documentId, pieceId } = req.params;
    const { piece_value_id } = req.body; // ✅ AJOUT
    const files = req.files;

    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    for (const file of files) {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      await DocumentFichier.create(
        {
          document_id: documentId,
          piece_id: pieceId,
          piece_value_id: piece_value_id || null, // ✅ Lier à la valeur si fourni
          fichier: publicPath,
          original_name: file.originalname,
          mode: "INDIVIDUEL",
        },
        { transaction: t },
      );
    }

    await t.commit();

    res.json({
      message: "Fichiers ajoutés avec succès",
      count: files.length,
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ Erreur upload:", err);
    res.status(500).json({ message: err.message });
  }
};

// document.controller.js - Ajoutez cette nouvelle fonction

/**
 * Upload d'un fichier pour une métadonnée de pièce spécifique
 */
exports.uploadPieceFile = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { documentId, pieceId } = req.params;
    const { piece_value_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    // Vérifier que piece_value_id est fourni
    if (!piece_value_id) {
      await t.rollback();
      return res.status(400).json({
        message:
          "piece_value_id est requis pour lier le fichier à la métadonnée",
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      const docFichier = await DocumentFichier.create(
        {
          document_id: documentId,
          piece_id: pieceId,
          piece_value_id: piece_value_id,
          fichier: publicPath,
          original_name: file.originalname,
          mode: "INDIVIDUEL",
        },
        { transaction: t },
      );

      uploadedFiles.push(docFichier);
    }

    await t.commit();

    res.json({
      message: "Fichier(s) uploadé(s) avec succès",
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ Erreur uploadPieceFile:", err);
    res.status(500).json({
      message: "Erreur lors de l'upload du fichier",
      error: err.message,
    });
  }
};

// PATCH /documents/:documentId/pieces/:pieceId/disponible

exports.updateDocumentPieceDisponibilite = async (req, res) => {
  try {
    const { documentId, pieceId } = req.params;
    const { disponible } = req.body;

    const [doc] = await DocumentPieces.findOrCreate({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      defaults: {
        disponible: false,
      },
    });

    if (!doc) {
      return res
        .status(404)
        .json({ message: "Relation document/pièce introuvable" });
    }

    doc.disponible = disponible;
    await doc.save();

    return res.json({
      message: "Disponibilité mise à jour",
      disponible: doc.disponible,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur update disponibilité" });
  }
};

exports.getDocumentFiles = async (req, res) => {
  try {
    const { documentId, pieceId } = req.params;

    const files = await DocumentFichier.findAll({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      order: [["created_at", "DESC"]],
    });

    return res.json(files);
  } catch (error) {
    console.error("❌ getPieceFiles error:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des fichiers",
    });
  }
};

exports.getDocumentPieces = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findByPk(documentId, {
      include: [
        {
          model: TypeDocument,
          include: [
            {
              model: Pieces,
              as: "pieces",
              attributes: ["id", "libelle", "code_pieces"],
              through: {
                model: TypeDocumentPieces,
                attributes: [],
              },
              include: [
                {
                  model: DocumentFichier,
                  as: "fichiers",
                  where: { document_id: documentId },
                  required: false,
                  attributes: ["id", "fichier", "original_name", "createdAt"],
                },
                // ✅ AJOUTEZ CET INCLUDE POUR LES MÉTADONNÉES
                {
                  model: PieceMetaField,
                  as: "metaFields",
                  attributes: [
                    "id",
                    "label",
                    "name",
                    "field_type",
                    "required",
                    "position",
                  ],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: {
            model: DocumentPieces,
            attributes: ["disponible"],
          },
        },
      ],
    });

    if (!document)
      return res.status(404).json({ message: "document introuvable" });

    // 🎯 Flatten propre pour le frontend
    const pieces = document.TypeDocument.Pieces.map((p) => ({
      id: p.id,
      libelle: p.libelle,
      code_pieces: p.code_pieces,
      disponible: p.document_pieces?.disponible ?? false,
      fichiers: p.fichiers || [],
      metaFields: p.metaFields || [], // ✅ INCLURE LES MÉTADONNÉES
    }));

    res.json({ pieces });
  } catch (error) {
    console.error("🔥 getDocumentPieces error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getLotUniqueFiles = async (req, res) => {
  try {
    const { documentId } = req.params;

    const files = await DocumentFichier.findAll({
      where: {
        document_id: documentId,
        mode: "LOT_UNIQUE",
      },
      order: [["created_at", "DESC"]],
    });

    return res.json(files);
  } catch (error) {
    console.error("❌ getLotUniqueFiles:", error);
    return res.status(500).json({ message: "Erreur récupération lot unique" });
  }
};
