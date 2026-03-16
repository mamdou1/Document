// controllers/fonction.controller.js
const { Fonction } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.createFonction = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'une fonction", {
      userId: req.user?.id,
      body: req.body,
    });

    const fonction = await Fonction.create(req.body);

    logger.info("✅ Fonction créée avec succès", {
      fonctionId: fonction.id,
      libelle: fonction.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "fonction", fonction);

    res.status(201).json(fonction);
  } catch (err) {
    logger.error("❌ Erreur création fonction:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur création fonction", error: err.message });
  }
};

exports.getAllFonctions = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de toutes les fonctions", {
      userId: req.user?.id,
      query: req.query,
    });

    // ✅ Ajouter les associations
    const fonctions = await Fonction.findAll({
      include: [
        {
          model: require("../models").EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code", "titre"],
        },
        {
          model: require("../models").EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code", "titre"],
        },
        {
          model: require("../models").EntiteeTrois,
          as: "entitee_trois",
          attributes: ["id", "libelle", "code", "titre"],
        },
      ],
    });

    logger.info("✅ Fonctions récupérées", {
      count: fonctions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(fonctions);
  } catch (err) {
    logger.error("❌ Erreur récupération fonctions:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.getFonctionById = async (req, res) => {
  const { id } = req.params;

  try {
    const fonction = await Fonction.findByPk(id, {
      include: [
        {
          model: require("../models").EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code", "titre"],
        },
        {
          model: require("../models").EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code", "titre"],
        },
        {
          model: require("../models").EntiteeTrois,
          as: "entitee_trois",
          attributes: ["id", "libelle", "code", "titre"],
        },
      ],
    });

    if (!fonction) {
      return res.status(404).json({ message: "Fonction non trouvée" });
    }

    res.json(fonction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFonctions = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'une fonction", {
      fonctionId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldFonction = await Fonction.findByPk(id);
    if (!oldFonction) {
      logger.warn("⚠️ Fonction non trouvée", {
        fonctionId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Fonction non trouvée" });
    }

    const oldCopy = oldFonction.toJSON();
    const payload = req.body;

    await oldFonction.update(payload);

    const updatedFonction = await Fonction.findByPk(id);

    logger.info("✅ Fonction mise à jour avec succès", {
      fonctionId: id,
      libelle: updatedFonction.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(
      req,
      "fonction",
      oldCopy,
      updatedFonction,
    );

    res.status(200).json(updatedFonction);
  } catch (err) {
    logger.error("❌ Erreur mise à jour fonction:", {
      fonctionId: id,
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur mise à jour fonctions", error: err.message });
  }
};

exports.deleteFonction = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une fonction", {
      fonctionId: id,
      userId: req.user?.id,
    });

    const fonction = await Fonction.findByPk(id);
    if (!fonction) {
      logger.warn("⚠️ Fonction non trouvée pour suppression", {
        fonctionId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Fonction non trouvée" });
    }

    await fonction.destroy();

    logger.info("✅ Fonction supprimée avec succès", {
      fonctionId: id,
      libelle: fonction.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "fonction", fonction);

    res.status(200).json({ message: "Fonction supprimée" });
  } catch (err) {
    logger.error("❌ Erreur suppression fonction:", {
      fonctionId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur suppression fonctions", error: err.message });
  }
};
