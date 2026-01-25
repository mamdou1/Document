const { Type, Pieces, Division, sequelize } = require("../models");

exports.createType = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Accès refusé" });

    const { codeType, nom, pieces } = req.body;

    if (!codeType || !nom)
      return res.status(400).json({ message: "codeType et nom sont requis" });

    // 1️⃣ Créer le type
    const type = await Type.create(
      {
        codeType,
        nom: nom.toUpperCase(),
      },
      { transaction: t },
    );

    // 2️⃣ Si des pièces sont fournies → on les lie
    if (Array.isArray(pieces) && pieces.length > 0) {
      const pieceIds = pieces.map((p) => p.piece);

      const piecesExist = await Pieces.findAll({
        where: { id: pieceIds },
        transaction: t,
      });

      if (piecesExist.length !== pieceIds.length) {
        await t.rollback();
        return res.status(400).json({ message: "Pièces invalides" });
      }

      for (const p of pieces) {
        await type.addPiece(p.piece, {
          through: {
            disponible: p.disponible ?? false,
            //fichier: null,
          },
          transaction: t,
        });
      }
    }

    await t.commit();
    res.status(201).json(type);
  } catch (err) {
    await t.rollback();
    console.error("🔥 createType error :", err);
    res.status(500).json({ message: err.message });
  }
};

exports.addPiecesToType = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { pieces } = req.body;

    const type = await Type.findByPk(id);
    if (!type) return res.status(404).json({ message: "Type introuvable" });

    for (const p of pieces) {
      await type.addPiece(p.piece, {
        through: {
          disponible: p.disponible ?? false,
          //fichier: null,
        },
        transaction: t,
      });
    }

    await t.commit();
    res.json({ message: "Pièces ajoutées avec succès" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.getType = async (req, res) => {
  try {
    const types = await Type.findAll({
      include: [
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          //through: { attributes: ["disponible"] },
          include: [
            {
              model: Division,
              as: "division",
              attributes: ["id", "libelle"],
            },
          ],
        },
      ],
    });

    //console.log(types);

    const formatted = types.map((t) => ({
      id: t.id,
      codeType: t.codeType ?? t.code_type,
      nom: t.nom,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      // On s'assure que "Pieces" existe avant de mapper
      Pieces: (t.Pieces || []).map((p) => ({
        id: p.id,
        libelle: p.libelle,
        code_pieces: p.code_pieces,
        disponible: p.type_pieces?.disponible,
        // --- AJOUT : Transmettre la division au formaté ---
        division: p.division
          ? {
              id: p.division.id,
              libelle: p.division.libelle,
            }
          : null,
      })),
    }));

    //console.log(formatted);

    res.json({ type: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await Type.findByPk(id);

    if (!type) return res.status(404).json({ message: "Type non trouvé" });

    await type.destroy();
    res.status(200).json({ message: "Type supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur suppresion Type", error: err.message });
  }
};

exports.getTypeById = async (req, res) => {
  try {
    const type = await Type.findByPk(req.params.id, {
      include: {
        model: Pieces,
        as: "pieces",
        attributes: ["id", "libelle", "code_pieces"],
        // --- AJOUT : Inclure la division rattachée à la pièce ---
        include: {
          model: Division,
          as: "division",
          attributes: ["id", "libelle"],
        },
        through: {
          attributes: ["disponible"],
        },
      },
    });

    if (!type) return res.status(404).json({ message: "Non trouvé" });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.uploadPiecePdf = async (req, res) => {
//   try {
//     const { typeId, pieceId } = req.params;

//     if (!req.file) return res.status(400).json({ message: "Aucun fichier" });

//     const pivot = await sequelize.models.type_pieces.findOne({
//       where: {
//         type_id: typeId,
//         pieces_id: pieceId,
//       },
//     });

//     if (!pivot) return res.status(404).json({ message: "Pièce introuvable" });

//     await pivot.update({
//       disponible: true,
//       fichier: req.file.path,
//     });

//     res.json({ message: "PDF ajouté", fichier: pivot.fichier });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };
