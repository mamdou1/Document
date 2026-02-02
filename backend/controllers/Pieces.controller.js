const {
  Pieces,
  Division,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  sequelize,
} = require("../models");
const HistoriqueService = require("../services/historique.service");

// exports.createPieces = async (req, res) => {
//   try {
//     if (req.user.role !== "ADMIN")
//       return res.status(403).json({ message: "Accès refusé" });

//     const {
//       code_pieces,
//       libelle,
//       division_id,
//       entitee_un_id,
//       entitee_deux_id,
//       entitee_trois_id,
//     } = req.body;

//     if (!libelle || !code_pieces)
//       return res
//         .status(400)
//         .json({ message: "Le libellé et le code sont requis" });

//     const exist = await Pieces.findOne({
//       where: { code_pieces: code_pieces.toUpperCase() }, // Mieux de vérifier le code unique
//     });

//     if (exist)
//       return res.status(400).json({ message: "Ce code de pièce existe déjà" });

//     const pieces = await Pieces.create({
//       code_pieces: code_pieces.toUpperCase(),
//       libelle: libelle.toUpperCase(),
//       // Sécurité : au cas où le front envoie l'objet complet au lieu de l'ID
//       division_id: division_id?.id || division_id,
//       entitee_un_id: entitee_un_id?.id || entitee_un_id,
//       entitee_deux_id: entitee_deux_id?.id || entitee_deux_id,
//       entitee_trois_id: entitee_trois_id?.id || entitee_trois_id,
//     });

//     res.status(201).json(pieces);
//   } catch (err) {
//     console.error("Erreur Create Pieces:", err);
//     res.status(500).json({ message: "Impossible de créer la pièce" });
//   }
// };

// exports.getPieces = async (req, res) => {
//   try {
//     const pieces = await Pieces.findAll({
//       include: [
//         {
//           model: Division,
//           as: "division",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: EntiteeUn,
//           as: "entitee_un",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: EntiteeDeux,
//           as: "entitee_deux",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: EntiteeTrois,
//           as: "entitee_trois",
//           attributes: ["id", "libelle"],
//         },
//       ],
//     });
//     res.status(200).json(pieces);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "Impossible de récupérer les types de dépense",
//     });
//   }
// };

// exports.updatePieces = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const piece = await Pieces.findByPk(id);

//     if (!piece) return res.status(404).json({ message: "Pièce introuvable" });

//     // On prépare les données en vérifiant si c'est un ID ou un objet (sécurité front-end)
//     const updateData = {
//       code_pieces: req.body.code_pieces?.toUpperCase() || piece.code_pieces,
//       libelle: req.body.libelle?.toUpperCase() || piece.libelle,
//       division_id:
//         req.body.division_id?.id ?? req.body.division_id ?? piece.division_id,
//       entitee_un_id:
//         req.body.entitee_un_id?.id ??
//         req.body.entitee_un_id ??
//         piece.entitee_un_id,
//       entitee_deux_id:
//         req.body.entitee_deux_id?.id ??
//         req.body.entitee_deux_id ??
//         piece.entitee_deux_id,
//       entitee_trois_id:
//         req.body.entitee_trois_id?.id ??
//         req.body.entitee_trois_id ??
//         piece.entitee_trois_id,
//     };

//     await piece.update(updateData);

//     // Optionnel : Recharger avec les includes pour renvoyer l'objet complet au front
//     const updatedPiece = await Pieces.findByPk(id, {
//       include: ["division", "entitee_un", "entitee_deux", "entitee_trois"],
//     });

//     res.status(200).json(updatedPiece);
//   } catch (err) {
//     console.error("Erreur Update Pieces:", err);
//     res.status(500).json({ message: "Erreur lors de la mise à jour" });
//   }
// };

exports.createPieces = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      code_pieces,
      libelle,
      division_id,
      entites_un_id, // Tableaux d'IDs reçus du front
      entites_deux_id,
      entites_trois_id,
    } = req.body;

    if (!libelle || !code_pieces) {
      return res
        .status(400)
        .json({ message: "Le libellé et le code sont requis" });
    }

    const exist = await Pieces.findOne({
      where: { code_pieces: code_pieces.toUpperCase() },
    });

    if (exist) {
      await t.rollback();
      return res.status(400).json({ message: "Ce code de pièce existe déjà" });
    }

    // 1. Création de la pièce (champs de base)
    const piece = await Pieces.create(
      {
        code_pieces: code_pieces.toUpperCase(),
        libelle: libelle.toUpperCase(),
        division_id: division_id?.id || division_id,
      },
      { transaction: t },
    );

    // 2. Association des relations Many-to-Many
    if (entites_un_id)
      await piece.setEntites_un(entites_un_id, { transaction: t });
    if (entites_deux_id)
      await piece.setEntites_deux(entites_deux_id, { transaction: t });
    if (entites_trois_id)
      await piece.setEntites_trois(entites_trois_id, { transaction: t });

    await t.commit();

    const result = await Pieces.findByPk(piece.id, {
      include: ["division", "entites_un", "entites_deux", "entites_trois"],
    });

    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    console.error("Erreur Create Pieces:", err);
    res
      .status(500)
      .json({ message: "Impossible de créer la pièce : " + err.message });
  }
};

exports.updatePieces = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      code_pieces,
      libelle,
      division_id,
      entites_un_id,
      entites_deux_id,
      entites_trois_id,
    } = req.body;

    const piece = await Pieces.findByPk(id);
    if (!piece) {
      await t.rollback();
      return res.status(404).json({ message: "Pièce introuvable" });
    }

    // 1. Update champs de base
    await piece.update(
      {
        code_pieces: code_pieces?.toUpperCase() || piece.code_pieces,
        libelle: libelle?.toUpperCase() || piece.libelle,
        division_id: division_id || piece.division_id,
      },
      { transaction: t },
    );

    // 2. Update relations (remplace les anciennes par les nouvelles)
    if (entites_un_id !== undefined)
      await piece.setEntites_un(entites_un_id, { transaction: t });
    if (entites_deux_id !== undefined)
      await piece.setEntites_deux(entites_deux_id, { transaction: t });
    if (entites_trois_id !== undefined)
      await piece.setEntites_trois(entites_trois_id, { transaction: t });

    await t.commit();

    const updated = await Pieces.findByPk(id, {
      include: ["division", "entites_un", "entites_deux", "entites_trois"],
    });

    res.status(200).json(updated);
  } catch (err) {
    await t.rollback();
    console.error("Erreur Update Pieces:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

exports.getPieces = async (req, res) => {
  try {
    const pieces = await Pieces.findAll({
      include: [
        { model: Division, as: "division" },
        { model: EntiteeUn, as: "entites_un" },
        { model: EntiteeDeux, as: "entites_deux" },
        { model: EntiteeTrois, as: "entites_trois" },
      ],
    });
    res.status(200).json(pieces);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération" });
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
