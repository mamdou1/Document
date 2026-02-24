// controllers/entiteeTrois.controller.js
const { Fonction, EntiteeUn, EntiteeDeux, EntiteeTrois } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.createEntiteeTrois = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'une entité de niveau 3", {
      userId: req.user?.id,
      body: req.body,
    });

    // 1. Trouver le titre utilisé par les autres éléments
    const exemple = await EntiteeTrois.findOne({ attributes: ["titre"] });
    const titreGlobal = exemple?.titre || "Défaut";

    // 2. Créer l'élément avec le titre récupéré
    const entitee_trois = await EntiteeTrois.create({
      ...req.body,
      titre: titreGlobal,
    });

    logger.info("✅ Entité de niveau 3 créée avec succès", {
      entiteeId: entitee_trois.id,
      libelle: entitee_trois.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "entiteeTrois", entitee_trois);

    res.status(201).json(entitee_trois);
  } catch (err) {
    logger.error("❌ Erreur création entiteeTrois:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur création EntiteeTrois", error: err.message });
  }
};

exports.getAllEntiteeTrois = async (req, res) => {
  const startTime = Date.now();

  try {
    const entitee_trois = await EntiteeTrois.findAll({
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle"],
            },
          ],
        },
      ],
    });

    res.json(entitee_trois);
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération EntiteeTrois",
      error: err.message,
    });
  }
};

exports.getEntiteeTroisTitre = async (req, res) => {
  const startTime = Date.now();

  try {
    const entitee = await EntiteeTrois.findOne({ attributes: ["titre"] });

    res.json({ titre: entitee.titre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEntiteeTroisTitre = async (req, res) => {
  const startTime = Date.now();

  try {
    const { titre } = req.body;
    if (!titre) {
      logger.warn("⚠️ Tentative de mise à jour sans titre", {
        userId: req.user?.id,
      });
      return res.status(400).json({ message: "Le champ 'titre' est requis" });
    }

    logger.info("📝 Tentative de mise à jour du titre global", {
      userId: req.user?.id,
      nouveauTitre: titre,
    });

    // Récupérer l'ancien titre pour l'historique
    const oldTitre = await EntiteeTrois.findOne({ attributes: ["titre"] });
    const oldValue = oldTitre ? oldTitre.titre : null;

    // Vérifier l'existence d'enregistrements
    const count = await EntiteeTrois.count();

    if (count === 0) {
      // Création initiale si la table est vide
      await EntiteeTrois.create({
        titre: titre,
        code: "INIT",
        libelle: "Premier élément EntiteeTrois",
      });

      logger.info("✅ Titre initial créé pour EntiteeTrois", {
        titre,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({
        message: "Titre initial créé pour EntiteeTrois",
        titre,
      });
    }

    // Mise à jour globale de la colonne titre
    await EntiteeTrois.update({ titre: titre }, { where: {} });

    logger.info("✅ Titre global mis à jour avec succès", {
      ancienTitre: oldValue,
      nouveauTitre: titre,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "entiteeTrois_titre",
      resource_id: null,
      resource_identifier: "titre global",
      description: `Modification du titre global : ${oldValue || "null"} → ${titre}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      old_data: { titre: oldValue },
      new_data: { titre },
      data: { duration: Date.now() - startTime },
    });

    res.json({
      message: "Titre mis à jour pour tous les éléments de EntiteeTrois",
      titre,
    });
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeTroisTitre:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.getEntiteeTroisByEntiteeDeux = async (req, res) => {
  const startTime = Date.now();
  const { entiteeDeuxId } = req.params;

  try {
    logger.debug("🔍 Récupération des entités niveau 3 par entité niveau 2", {
      entiteeDeuxId,
      userId: req.user?.id,
    });

    const entitee_trois = await EntiteeTrois.findAll({
      where: { entitee_deux_id: entiteeDeuxId },
    });

    logger.info("✅ Entités niveau 3 récupérées", {
      entiteeDeuxId,
      count: entitee_trois.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(entitee_trois);
  } catch (err) {
    logger.error("❌ Erreur getEntiteeTroisByEntiteeDeux:", {
      entiteeDeuxId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur récupération EntiteeTrois",
      error: err.message,
    });
  }
};

exports.getFunctionsByEntiteeTrois = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des fonctions d'une entité niveau 3", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const fonctions = await Fonction.findAll({
      where: { entitee_trois_id: id },
    });

    logger.info("✅ Fonctions récupérées", {
      entiteeId: id,
      count: fonctions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(fonctions);
  } catch (err) {
    logger.error("❌ Erreur getFunctionsByEntiteeTrois:", {
      entiteeId: id,
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

exports.updateEntiteeTrois = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de modification d'une entité niveau 3", {
      entiteeId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldEntitee = await EntiteeTrois.findByPk(id);
    if (!oldEntitee) {
      logger.warn("⚠️ Entité niveau 3 non trouvée", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "EntiteeTrois non trouvé" });
    }

    const oldCopy = oldEntitee.toJSON();
    const payload = req.body;

    await oldEntitee.update(payload);

    const updated = await EntiteeTrois.findByPk(id, {
      include: [{ model: EntiteeDeux, as: "entitee_deux" }],
    });

    logger.info("✅ Entité niveau 3 modifiée avec succès", {
      entiteeId: id,
      libelle: updated.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "entiteeTrois", oldCopy, updated);

    res.status(200).json(updated);
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeTrois:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur mise à jour entitee_trois",
      error: err.message,
    });
  }
};

exports.deleteEntiteeTrois = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une entité niveau 3", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const ent = await EntiteeTrois.findByPk(id);
    if (!ent) {
      logger.warn("⚠️ Entité niveau 3 non trouvée pour suppression", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "EntiteeTrois non trouvé" });
    }

    await ent.destroy();

    logger.info("✅ Entité niveau 3 supprimée avec succès", {
      entiteeId: id,
      libelle: ent.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "entiteeTrois", ent);

    res.status(200).json({ message: "EntiteeTrois supprimé" });
  } catch (err) {
    logger.error("❌ Erreur deleteEntiteeTrois:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur suppression EntiteeTrois", error: err.message });
  }
};
