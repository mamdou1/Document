const { PieceValue, PieceMetaField, DocumentFichier } = require("../models");

// Récupérer toutes les valeurs pour un document
exports.getPieceValuesByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const values = await PieceValue.findAll({
      where: { document_id: documentId },
      include: [
        {
          model: PieceMetaField,
          as: "piece_metaField",
          attributes: ["id", "label", "name", "field_type", "required"],
        },
        {
          model: DocumentFichier,
          as: "file",
          attributes: ["id", "fichier", "original_name"],
        },
      ],
    });

    res.json(values);
  } catch (error) {
    console.error("❌ Erreur getPieceValuesByDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les valeurs pour une pièce spécifique
exports.getPieceValuesByPiece = async (req, res) => {
  try {
    const { documentId, pieceId } = req.params;

    const values = await PieceValue.findAll({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      include: [
        {
          model: PieceMetaField,
          as: "piece_metaField",
          attributes: ["id", "label", "name", "field_type", "required"],
        },
        {
          model: DocumentFichier,
          as: "file",
          attributes: ["id", "fichier", "original_name"],
        },
      ],
    });

    res.json(values);
  } catch (error) {
    console.error("❌ Erreur getPieceValuesByPiece:", error);
    res.status(500).json({ message: error.message });
  }
};

// Créer une nouvelle valeur
// Créer ou mettre à jour une valeur (UPSERT)
exports.createPieceValue = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { piece_id, piece_meta_field_id, value, row_id } = req.body; // ✅ AJOUTER row_id

    console.log("📦 Création PieceValue:", {
      documentId,
      piece_id,
      piece_meta_field_id,
      value,
      row_id,
    });

    // ✅ CRÉATION SIMPLE, sans findOrCreate
    const pieceValue = await PieceValue.create({
      document_id: parseInt(documentId),
      piece_id: parseInt(piece_id),
      piece_meta_field_id: parseInt(piece_meta_field_id),
      value: value || null,
      row_id: row_id || null, // ✅ IMPORTANT: sauvegarder le row_id
    });

    res.status(201).json(pieceValue);
  } catch (error) {
    console.error("❌ Erreur createPieceValue:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une valeur
exports.updatePieceValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const pieceValue = await PieceValue.findByPk(id);
    if (!pieceValue) {
      return res.status(404).json({ message: "Valeur non trouvée" });
    }

    await pieceValue.update({ value });
    res.json(pieceValue);
  } catch (error) {
    console.error("❌ Erreur updatePieceValue:", error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une valeur
exports.deletePieceValue = async (req, res) => {
  try {
    const { id } = req.params;
    await PieceValue.destroy({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur deletePieceValue:", error);
    res.status(500).json({ message: error.message });
  }
};
