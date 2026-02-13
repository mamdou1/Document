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
} = require("../models");
const buildAccessWhere = require("../utils/buildAccessWhere.utils");

/*

exports.create = async (req, res) => {
  try {
    const { type_document_id, values } = req.body;

    console.log("📥 Payload reçu:", req.body);

    const doc = await Document.create({ type_document_id });
    console.log("✅ Document créé:", doc.id);

    for (const [meta_field_id, value] of Object.entries(values)) {
      console.log(
        `➡️ Insertion valeur: meta_field_id=${meta_field_id}, value=${value}`,
      );
      await DocumentValue.create({
        document_id: doc.id,
        meta_field_id,
        value,
      });
    }

    console.log("✅ Toutes les valeurs insérées");

    res.json({ id: doc.id, type_document_id: doc.type_document_id });
  } catch (e) {
    console.error("❌ Erreur create document:", e); // 👈 log complet
    res.status(500).json({ message: e.message, stack: e.stack });
  }
};

*/

exports.create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { type_document_id, values } = req.body;

    if (!type_document_id) {
      return res
        .status(400)
        .json({ message: "Le type de document est requis" });
    }

    // 1. Créer le document
    const doc = await Document.create({ type_document_id }, { transaction: t });

    const typeDocumentPieces =
      await sequelize.models.TypeDocumentPieces.findAll({
        where: { document_type_id: type_document_id },
        transaction: t,
      });

    if (typeDocumentPieces.length > 0) {
      console.log(
        "📋 Détail des pièces:",
        typeDocumentPieces.map((p) => ({
          id: p.id,
          piece_id: p.piece_id,
          document_type_id: p.document_type_id,
        })),
      );

      const pieceRows = typeDocumentPieces.map((tp) => ({
        document_id: doc.id,
        piece_id: tp.piece_id,
        disponible: false,
      }));

      await DocumentPieces.bulkCreate(pieceRows, { transaction: t });
    } else {
      // Vérifier si le type de document existe
      const typeDoc = await sequelize.models.TypeDocument.findByPk(
        type_document_id,
        { transaction: t },
      );
      console.log(
        `ℹ️ Type de document ${type_document_id}: ${typeDoc ? typeDoc.nom : "NON TROUVÉ !"}`,
      );
    }

    // 3. Meta values
    if (values && Object.keys(values).length > 0) {
      const metaRows = Object.entries(values).map(([meta_field_id, value]) => ({
        document_id: doc.id,
        meta_field_id: parseInt(meta_field_id),
        value: value.toString(),
      }));
      await DocumentValue.bulkCreate(metaRows, { transaction: t });
      console.log(`✅ ${metaRows.length} valeurs meta insérées`);
    }

    await t.commit();

    res.status(201).json({
      message: "Document créé avec succès",
      id: doc.id,
      type_document_id: doc.type_document_id,
      pieces_count: typeDocumentPieces.length,
    });
  } catch (e) {
    if (t) await t.rollback();
    res.status(500).json({
      message: "Erreur lors de la création du document",
      error: e.message,
    });
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

exports.uploadDocumentFiles = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { documentId, pieceId, documentTypeId } = req.params;
    const { upload_mode } = req.body;
    const files = req.files;

    console.log("📝 UPLOAD DOCUMENT - Params:", {
      documentId,
      pieceId,
      documentTypeId,
    });
    console.log("📝 UPLOAD DOCUMENT - Mode:", upload_mode);
    console.log("📝 UPLOAD DOCUMENT - Fichiers:", files?.length || 0);

    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    // ==================== MODE LOT UNIQUE ====================
    if (upload_mode === "LOT_UNIQUE") {
      console.log("📦 Traitement en mode LOT_UNIQUE");

      for (const file of files) {
        const publicPath = file.path
          .replace(/\\/g, "/")
          .replace(/^.*uploads\//, "uploads/");

        console.log("📁 Fichier enregistré:", publicPath);

        await DocumentFichier.create(
          {
            document_id: documentId,
            piece_id: null, // LOT_UNIQUE n'est pas lié à une pièce spécifique
            fichier: publicPath,
            original_name: file.originalname,
            mode: "LOT_UNIQUE",
          },
          { transaction: t },
        );
      }

      await t.commit();

      return res.json({
        message: "Dossier complet uploadé avec succès",
        mode: "LOT_UNIQUE",
        fichiers_count: files.length,
      });
    }

    // ==================== MODE INDIVIDUEL (par défaut) ====================
    if (!pieceId || pieceId === "undefined" || pieceId === "null") {
      await t.rollback();
      return res.status(400).json({
        message: "ID de pièce requis pour le mode INDIVIDUEL",
      });
    }

    console.log("📄 Traitement en mode INDIVIDUEL pour pièce:", pieceId);

    // Vérifier que la pièce est autorisée pour ce type de document
    const relation = await TypeDocumentPieces.findOne({
      where: {
        document_type_id: documentTypeId,
        piece_id: pieceId,
      },
      transaction: t,
    });

    if (!relation) {
      await t.rollback();
      return res.status(403).json({
        message: "Pièce non autorisée pour ce type de document",
      });
    }

    // Vérifier que le document existe et que la pièce est disponible
    const docPiece = await DocumentPieces.findOne({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      transaction: t,
    });

    if (!docPiece) {
      console.log(
        `⚠️ DocumentPieces non trouvé pour document ${documentId}, pièce ${pieceId}`,
      );
      // On peut créer l'association si elle n'existe pas
      await DocumentPieces.create(
        {
          document_id: documentId,
          piece_id: pieceId,
          disponible: true,
        },
        { transaction: t },
      );
    }

    // Enregistrer les fichiers
    const records = [];

    for (const file of files) {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      console.log("📁 Fichier enregistré:", publicPath);

      const docFichier = await DocumentFichier.create(
        {
          document_id: documentId,
          piece_id: pieceId,
          fichier: publicPath,
          original_name: file.originalname,
          mode: "INDIVIDUEL",
        },
        { transaction: t },
      );

      records.push(docFichier);
    }

    await t.commit();

    res.json({
      message: "Fichiers ajoutés avec succès",
      mode: "INDIVIDUEL",
      fichiers: records,
      count: records.length,
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ Erreur uploadDocumentFiles:", err);
    res.status(500).json({
      message: "Erreur lors de l'upload des fichiers",
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
                attributes: [], // pas dispo ici
              },
              include: [
                {
                  model: DocumentFichier,
                  as: "fichiers",
                  where: { document_id: documentId },
                  required: false, // important
                  attributes: ["id", "fichier", "original_name", "createdAt"],
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
      disponible: p.document_pieces.disponible ?? false,
      fichiers: p.fichiers || [],
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
