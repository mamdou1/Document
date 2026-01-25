const { TypeDocument, MetaField } = require("../models");

exports.create = async (req, res) => {
  try {
    const field = await MetaField.create({
      ...req.body,
      type_document_id: req.params.typeId,
    });
    res.json(field);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    await MetaField.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await MetaField.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getByType = async (req, res) => {
  try {
    const typeId = req.params.typeId;

    const typeDocument = await TypeDocument.findByPk(typeId, {
      include: [{ model: MetaField, as: "metaFields" }],
    });

    if (!typeDocument) {
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    res.json(typeDocument.metaFields);
  } catch (e) {
    console.error("❌ Erreur getByType metaFields:", e);
    res.status(500).json({ message: e.message });
  }
};
