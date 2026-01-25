const { Pieces, Division } = require("../models");
const HistoriqueService = require("../services/historique.service");

exports.createPieces = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Accès refusé" });

    const { code_pieces, libelle, division_id } = req.body;
    console.log("📥 BODY REÇU :", req.body);
    if (!libelle || !code_pieces)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const exist = await Pieces.findOne({
      where: { libelle: libelle.toUpperCase() },
    });

    if (exist)
      return res
        .status(400)
        .json({ message: "Cette pièce de dépense existe déjà" });

    const pieces = await Pieces.create({
      code_pieces,
      libelle: libelle.toUpperCase(),
      division_id,
    });

    res.status(201).json({ pieces });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Impossible de créer ce type de dépense",
    });
  }
};

exports.getPieces = async (req, res) => {
  try {
    const pieces = await Pieces.findAll({
      include: [
        {
          model: Division,
          as: "division",
          attributes: ["id", "libelle"],
        },
      ],
    });
    res.status(200).json(pieces);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Impossible de récupérer les types de dépense",
    });
  }
};

exports.updatePieces = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const pieces = await Pieces.findByPk(id);
    if (!pieces) return res.status(404).json({ message: "Pièce introuvable" });

    await pieces.update({
      code_pieces: payload.code_pieces ?? pieces.code_pieces, // ✅ cohérent
      libelle: payload.libelle ? payload.libelle.toUpperCase() : pieces.libelle,
      division_id: payload.division_id ?? pieces.division_id, // ✅ mise à jour division
    });

    res.status(200).json(pieces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deletePiece = async (req, res) => {
  try {
    const { id } = req.params;
    const piece = await Pieces.findByPk(id);

    if (!piece) return res.status(404).json({ message: "Piece non trouvé" });

    await piece.destroy();
    res.status(200).json({ message: "Division piece" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur supprision piece", error: err.message });
  }
};
