const { PieceMetaField, Pieces } = require("../models");

exports.create = async (req, res) => {
  try {
    const { pieceId } = req.params;
    const { name, label, field_type, required, position } = req.body;

    const piece = await Pieces.findByPk(pieceId);
    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    const metaField = await PieceMetaField.create({
      piece_id: pieceId,
      name,
      label,
      field_type,
      required: required || false,
      position: position || 0,
    });

    res.status(201).json(metaField);
  } catch (error) {
    console.error("❌ Erreur création métadonnée pièce:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, label, field_type, required, position } = req.body;

    const metaField = await PieceMetaField.findByPk(id);
    if (!metaField) {
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    await metaField.update({ name, label, field_type, required, position });
    res.json(metaField);
  } catch (error) {
    console.error("❌ Erreur mise à jour métadonnée:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await PieceMetaField.destroy({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression métadonnée:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getByPiece = async (req, res) => {
  try {
    const { pieceId } = req.params;
    const metaFields = await PieceMetaField.findAll({
      where: { piece_id: pieceId },
      order: [["position", "ASC"]],
    });
    res.json(metaFields);
  } catch (error) {
    console.error("❌ Erreur récupération métadonnées:", error);
    res.status(500).json({ message: error.message });
  }
};
