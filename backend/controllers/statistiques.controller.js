const { sequelize } = require("../models");
const { Liquidation, Nature, Chapitre, Programme } = require("../models");

// ➤ Totaux par Programme
exports.getTotalByProgramme = async (req, res) => {
  try {
    const result = await Liquidation.findAll({
      attributes: [
        [sequelize.col("nature.chapitre.programme.id"), "programmeId"],
        [sequelize.col("nature.chapitre.programme.libelle"), "libelle"],
        [
          sequelize.fn("SUM", sequelize.col("Liquidation.montant")),
          "totalMontant",
        ],
      ],
      include: [
        {
          model: Nature,
          as: "nature",
          attributes: [],
          include: [
            {
              model: Chapitre,
              as: "chapitre",
              attributes: [],
              include: [
                {
                  model: Programme,
                  as: "programme",
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
      group: ["nature.chapitre.programme.id"],
      order: [[sequelize.literal("totalMontant"), "DESC"]],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur getTotalByProgramme:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Totaux par Chapitre
exports.getTotalByChapitre = async (req, res) => {
  try {
    const result = await Liquidation.findAll({
      attributes: [
        [sequelize.col("nature.chapitre.id"), "chapitreId"],
        [sequelize.col("nature.chapitre.libelle"), "libelle"],
        [
          sequelize.fn("SUM", sequelize.col("Liquidation.montant")),
          "totalMontant",
        ],
      ],
      include: [
        {
          model: Nature,
          as: "nature",
          attributes: [],
          include: [
            {
              model: Chapitre,
              as: "chapitre",
              attributes: [],
            },
          ],
        },
      ],
      group: ["nature.chapitre.id"],
      order: [[sequelize.literal("totalMontant"), "DESC"]],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur getTotalByChapitre:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Totaux par Nature
exports.getTotalByNature = async (req, res) => {
  try {
    const result = await Liquidation.findAll({
      attributes: [
        [sequelize.col("nature.id"), "natureId"],
        [sequelize.col("nature.libelle"), "libelle"],
        [
          sequelize.fn("SUM", sequelize.col("Liquidation.montant")),
          "totalMontant",
        ],
      ],
      include: [
        {
          model: Nature,
          as: "nature",
          attributes: [],
        },
      ],
      group: ["nature.id"],
      order: [[sequelize.literal("totalMontant"), "DESC"]],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur getTotalByNature:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
