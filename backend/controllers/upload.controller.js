const { DocumentValue, DocumentFile } = require("../models");

exports.uploadFile = async (req, res) => {
  try {
    const { documentId, fieldId } = req.params;

    const dv = await DocumentValue.create({
      document_id: documentId,
      meta_field_id: fieldId,
      value: req.file.path,
    });

    await DocumentFile.create({
      document_value_id: dv.id,
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
