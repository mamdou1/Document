const { PieceFichier } = require("../models");

exports.uploadMultipleFiles = async (req, res) => {
  try {
    const { type_piece_id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const savedFiles = await Promise.all(
      req.files.map((file) =>
        PieceFichier.create({
          type_piece_id: type_piece_id,
          fichier: file.path,
        })
      )
    );

    res.status(201).json({
      message: "Fichiers ajoutés avec succès",
      fichiers: savedFiles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
    const { typeId, pieceId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const savedFiles = await Promise.all(
      req.files.map((file) =>
        PieceFichier.create({
          type_id: typeId,
          piece_id: pieceId,
          fichier: file.path,
          original_name: file.originalname,
        })
      )
    );

    res.status(201).json({
      message: "Fichiers ajoutés avec succès",
      fichiers: savedFiles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFilesByPiece = async (req, res) => {
  const { typeId, pieceId } = req.params;

  const files = await PieceFichier.findAll({
    where: { type_id: typeId, piece_id: pieceId },
    order: [["createdAt", "DESC"]],
  });

  res.json(files);
};
