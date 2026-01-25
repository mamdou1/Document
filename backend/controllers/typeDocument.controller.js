const { TypeDocument, MetaField, Division, Document } = require("../models");

exports.create = async (req, res) => {
  try {
    const { code, nom, division_id } = req.body;
    const data = await TypeDocument.create({ code, nom, division_id });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await TypeDocument.findAll({
      include: [
        { model: MetaField, as: "metaFields" },
        //{ model: Document, as: "documents" },
        {
          model: Division,
          as: "division",
          attributes: ["id", "libelle"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await TypeDocument.findByPk(req.params.id, {
      include: [{ model: Division }, { model: MetaField }],
    });

    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    await TypeDocument.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await TypeDocument.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
