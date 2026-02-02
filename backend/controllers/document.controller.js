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
  // 1. Initialiser la transaction
  const t = await sequelize.transaction();

  try {
    const { type_document_id, values } = req.body;

    if (!type_document_id) {
      return res
        .status(400)
        .json({ message: "Le type de document est requis" });
    }

    // 2. Créer le document
    const doc = await Document.create({ type_document_id }, { transaction: t });

    // 3. Insérer les valeurs des champs Meta (si elles existent)
    if (values && Object.keys(values).length > 0) {
      const metaRows = Object.entries(values).map(([meta_field_id, value]) => ({
        document_id: doc.id,
        meta_field_id: parseInt(meta_field_id),
        value: value.toString(),
      }));

      await DocumentValue.bulkCreate(metaRows, { transaction: t });
    }

    // 4. Récupérer les pièces associées au type de document
    // Note: Vérifiez bien le nom de votre modèle (souvent au singulier dans Sequelize)
    const typeDocumentPieces = await TypeDocumentPieces.findAll({
      where: { document_type_id: type_document_id },
      transaction: t,
    });

    // 5. Associer ces pièces au document créé (Table DocumentPieces)
    if (typeDocumentPieces.length > 0) {
      const pieceRows = typeDocumentPieces.map((tp) => ({
        document_id: doc.id,
        piece_id: tp.piece_id,
        disponible: false, // Par défaut à faux comme dans liquidation
      }));

      await DocumentPieces.bulkCreate(pieceRows, { transaction: t });
    }

    // 6. Valider la transaction
    await t.commit();

    res.status(201).json({
      message: "Document créé avec succès",
      id: doc.id,
      type_document_id: doc.type_document_id,
    });
  } catch (e) {
    // 7. Annuler tout en cas d'erreur
    if (t) await t.rollback();

    console.error("❌ Erreur create document:", e);
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

    console.log("PARAMS =", req.params);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    const relation = await TypeDocumentPieces.findOne({
      where: {
        document_type_id: documentTypeId,
        piece_id: pieceId,
      },
      transaction: t,
    });

    if (!relation) {
      await t.rollback();
      return res
        .status(403)
        .json({ message: "Pièce non autorisée pour ce type" });
    }

    const records = req.files.map((file) => {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      return {
        document_id: documentId,
        piece_id: pieceId,
        fichier: publicPath,
        original_name: file.originalname,
      };
    });

    await DocumentFichier.bulkCreate(records, { transaction: t });

    await t.commit();

    res.json({
      message: "Fichiers ajoutés avec succès",
      fichiers: records,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
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
