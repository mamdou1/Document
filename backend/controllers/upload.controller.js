const { DocumentValue, DocumentFile } = require("../models");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    console.log("📥 req.file:", req.file); // 👈 log important
    console.log("📥 params:", req.params);

    const { documentId, fieldId } = req.params;

    const dv = await DocumentValue.create({
      document_id: documentId,
      meta_field_id: fieldId,
      value: req.file.path,
    });

    if (!dv || !dv.id) {
      return res.status(500).json({ message: "Échec création DocumentValue" });
    }
    const filename = Buffer.from(req.file.originalname, "latin1").toString(
      "utf8",
    );

    console.log("✅ DocumentValue créé:", dv);

    await DocumentFile.create({
      document_value_id: dv.id,
      filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
