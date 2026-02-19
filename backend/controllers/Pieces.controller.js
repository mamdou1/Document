const {
  Pieces,
  Division,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  sequelize,
} = require("../models");
const HistoriqueService = require("../services/historique.service");

exports.createPieces = async (req, res) => {
  try {
    const { code_pieces, libelle } = req.body;
    console.log("📤 Données réçu:", req.body);

    if (!libelle || !code_pieces)
      return res
        .status(400)
        .json({ message: "Le libellé et le code sont requis" });

    const exist = await Pieces.findOne({
      where: { code_pieces: code_pieces.toUpperCase() }, // Mieux de vérifier le code unique
    });

    if (exist)
      return res.status(400).json({ message: "Ce code de pièce existe déjà" });

    const pieces = await Pieces.create({
      code_pieces: code_pieces.toUpperCase(),
      libelle: libelle.toUpperCase(),
    });
    console.log("📤 Données enregistrer:", pieces);

    res.status(201).json(pieces);
  } catch (err) {
    console.error("Erreur Create Pieces:", err);
    res.status(500).json({ message: "Impossible de créer la pièce" });
  }
};

exports.getPieces = async (req, res) => {
  try {
    const pieces = await Pieces.findAll();
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
    const piece = await Pieces.findByPk(id);

    if (!piece) return res.status(404).json({ message: "Pièce introuvable" });

    // On prépare les données en vérifiant si c'est un ID ou un objet (sécurité front-end)
    const updateData = {
      code_pieces: req.body.code_pieces?.toUpperCase() || piece.code_pieces,
      libelle: req.body.libelle?.toUpperCase() || piece.libelle,
    };

    await piece.update(updateData);

    res.status(200).json(piece);
  } catch (err) {
    console.error("Erreur Update Pieces:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
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
