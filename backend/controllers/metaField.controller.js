// controllers/metaField.controller.js
const { TypeDocument, MetaField } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.create = async (req, res) => {
  const startTime = Date.now();
  const { typeId } = req.params;

  try {
    logger.info("📝 Tentative de création d'un champ de métadonnées", {
      typeId,
      userId: req.user?.id,
      body: req.body,
    });

    const field = await MetaField.create({
      ...req.body,
      type_document_id: typeId,
    });

    logger.info("✅ Champ de métadonnées créé avec succès", {
      metaFieldId: field.id,
      typeId,
      label: field.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "metaField", field);

    res.json(field);
  } catch (e) {
    logger.error("❌ Erreur création metaField:", {
      typeId,
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un champ de métadonnées", {
      metaFieldId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldMetaField = await MetaField.findByPk(id);
    if (!oldMetaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    const oldCopy = oldMetaField.toJSON();
    await oldMetaField.update(req.body);

    const updatedMetaField = await MetaField.findByPk(id);

    logger.info("✅ Champ de métadonnées mis à jour avec succès", {
      metaFieldId: id,
      label: updatedMetaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(
      req,
      "metaField",
      oldCopy,
      updatedMetaField,
    );

    res.json({ success: true });
  } catch (e) {
    logger.error("❌ Erreur update metaField:", {
      metaFieldId: id,
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un champ de métadonnées", {
      metaFieldId: id,
      userId: req.user?.id,
    });

    const metaField = await MetaField.findByPk(id);
    if (!metaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé pour suppression", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    await MetaField.destroy({ where: { id } });

    logger.info("✅ Champ de métadonnées supprimé avec succès", {
      metaFieldId: id,
      label: metaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "metaField", metaField);

    res.json({ success: true });
  } catch (e) {
    logger.error("❌ Erreur remove metaField:", {
      metaFieldId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.getByType = async (req, res) => {
  const startTime = Date.now();
  const { typeId } = req.params;

  try {
    logger.debug("🔍 Récupération des champs de métadonnées d'un type", {
      typeId,
      userId: req.user?.id,
    });

    const typeDocument = await TypeDocument.findByPk(typeId, {
      include: [{ model: MetaField, as: "metaFields" }],
    });

    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    logger.info("✅ Champs de métadonnées récupérés", {
      typeId,
      count: typeDocument.metaFields?.length || 0,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(typeDocument.metaFields);
  } catch (e) {
    logger.error("❌ Erreur getByType metaFields:", {
      typeId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};
