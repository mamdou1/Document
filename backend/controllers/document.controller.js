const {
  Document,
  DocumentValue,
  MetaField,
  DocumentFile,
  TypeDocument,
  Division,
} = require("../models");

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

    res.json(doc);
  } catch (e) {
    console.error("❌ Erreur create document:", e); // 👈 log complet
    res.status(500).json({ message: e.message, stack: e.stack });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Document.findAll({
      include: [
        {
          model: TypeDocument,
          as: "typeDocument",
          include: [
            { model: MetaField, as: "metaFields" },
            { model: Division, as: "division", attributes: ["id", "libelle"] },
          ],
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
