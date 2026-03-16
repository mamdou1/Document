// controllers/pieceMetaField.controller.js
const { PieceMetaField, Pieces } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.create = async (req, res) => {
  const startTime = Date.now();
  const { pieceId } = req.params;

  try {
    logger.info("📝 Tentative de création d'une métadonnée de pièce", {
      pieceId,
      userId: req.user?.id,
      body: req.body,
    });

    const piece = await Pieces.findByPk(pieceId);
    if (!piece) {
      logger.warn("⚠️ Pièce non trouvée", {
        pieceId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    const { name, label, field_type, required, position } = req.body;

    const metaField = await PieceMetaField.create({
      piece_id: pieceId,
      name,
      label,
      field_type,
      required: required || false,
      position: position || 0,
    });

    logger.info("✅ Métadonnée de pièce créée avec succès", {
      metaFieldId: metaField.id,
      pieceId,
      label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "pieceMetaField", metaField);

    res.status(201).json(metaField);
  } catch (error) {
    logger.error("❌ Erreur création métadonnée pièce:", {
      pieceId,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'une métadonnée de pièce", {
      metaFieldId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldMetaField = await PieceMetaField.findByPk(id);
    if (!oldMetaField) {
      logger.warn("⚠️ Métadonnée non trouvée", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    const oldCopy = oldMetaField.toJSON();
    const { name, label, field_type, required, position } = req.body;

    await oldMetaField.update({ name, label, field_type, required, position });

    const updatedMetaField = await PieceMetaField.findByPk(id);

    logger.info("✅ Métadonnée de pièce mise à jour avec succès", {
      metaFieldId: id,
      label: updatedMetaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(
      req,
      "pieceMetaField",
      oldCopy,
      updatedMetaField,
    );

    res.json(updatedMetaField);
  } catch (error) {
    logger.error("❌ Erreur mise à jour métadonnée:", {
      metaFieldId: id,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une métadonnée de pièce", {
      metaFieldId: id,
      userId: req.user?.id,
    });

    const metaField = await PieceMetaField.findByPk(id);
    if (!metaField) {
      logger.warn("⚠️ Métadonnée non trouvée pour suppression", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    await PieceMetaField.destroy({ where: { id } });

    logger.info("✅ Métadonnée de pièce supprimée avec succès", {
      metaFieldId: id,
      label: metaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "pieceMetaField", metaField);

    res.json({ success: true });
  } catch (error) {
    logger.error("❌ Erreur suppression métadonnée:", {
      metaFieldId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getByPiece = async (req, res) => {
  const startTime = Date.now();
  const { pieceId } = req.params;

  try {
    logger.debug("🔍 Récupération des métadonnées d'une pièce", {
      pieceId,
      userId: req.user?.id,
    });

    const metaFields = await PieceMetaField.findAll({
      where: { piece_id: pieceId },
      order: [["position", "ASC"]],
    });

    logger.info("✅ Métadonnées de la pièce récupérées", {
      pieceId,
      count: metaFields.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(metaFields);
  } catch (error) {
    logger.error("❌ Erreur récupération métadonnées:", {
      pieceId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};
