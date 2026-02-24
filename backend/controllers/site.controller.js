// controllers/site.controller.js
const { Site, Salle } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

/**
 * Créer un nouveau site
 */
exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'un site", {
      userId: req.user?.id,
      body: req.body,
    });

    const data = await Site.create(req.body);

    logger.info("✅ Site créé avec succès", {
      siteId: data.id,
      libelle: data.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "site", data);

    res.status(201).json(data);
  } catch (error) {
    logger.error("❌ Erreur création site:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la création du site",
      error: error.message,
    });
  }
};

/**
 * Récupérer tous les sites
 */
exports.findAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les sites", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await Site.findAll({
      include: [
        {
          model: Salle,
          as: "salles",
          required: false,
          attributes: ["id", "libelle", "code_salle"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    logger.info("✅ Sites récupérés", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "site",
        resource_id: null,
        resource_identifier: "liste des sites",
        description: "Consultation de la liste des sites",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: data.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur récupération sites:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la récupération des sites",
      error: error.message,
    });
  }
};

/**
 * Récupérer un site par son ID
 */
exports.findById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un site par ID", {
      siteId: id,
      userId: req.user?.id,
    });

    const data = await Site.findByPk(id, {
      include: [
        {
          model: Salle,
          as: "salles",
          required: false,
          attributes: ["id", "libelle", "code_salle"],
        },
      ],
    });

    if (!data) {
      logger.warn("⚠️ Site non trouvé", {
        siteId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Site non trouvé" });
    }

    logger.info("✅ Site trouvé", {
      siteId: id,
      libelle: data.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "site",
      resource_id: data.id,
      resource_identifier: `${data.libelle} (${data.id})`,
      description: `Consultation du site #${data.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
      },
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur récupération site:", {
      siteId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la récupération du site",
      error: error.message,
    });
  }
};

/**
 * Mettre à jour un site
 */
exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un site", {
      siteId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldSite = await Site.findByPk(id);
    if (!oldSite) {
      logger.warn("⚠️ Site non trouvé pour mise à jour", {
        siteId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Site non trouvé" });
    }

    const oldCopy = oldSite.toJSON();
    await Site.update(req.body, { where: { id } });

    const updatedSite = await Site.findByPk(id);

    logger.info("✅ Site mis à jour avec succès", {
      siteId: id,
      libelle: updatedSite.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "site", oldCopy, updatedSite);

    res.json({
      success: true,
      message: "Site mis à jour avec succès",
      data: updatedSite,
    });
  } catch (error) {
    logger.error("❌ Erreur mise à jour site:", {
      siteId: id,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la mise à jour du site",
      error: error.message,
    });
  }
};

/**
 * Supprimer un site
 */
exports.delete = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un site", {
      siteId: id,
      userId: req.user?.id,
    });

    const site = await Site.findByPk(id);
    if (!site) {
      logger.warn("⚠️ Site non trouvé pour suppression", {
        siteId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Site non trouvé" });
    }

    // Vérifier s'il y a des salles associées
    const salles = await Salle.findAll({ where: { site_id: id } });
    if (salles.length > 0) {
      logger.warn("⛔ Tentative de suppression d'un site avec des salles", {
        siteId: id,
        sallesCount: salles.length,
        userId: req.user?.id,
      });
      return res.status(400).json({
        message: "Impossible de supprimer ce site car il contient des salles",
        count: salles.length,
      });
    }

    await site.destroy();

    logger.info("✅ Site supprimé avec succès", {
      siteId: id,
      libelle: site.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "site", site);

    res.json({
      success: true,
      message: "Site supprimé avec succès",
    });
  } catch (error) {
    logger.error("❌ Erreur suppression site:", {
      siteId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la suppression du site",
      error: error.message,
    });
  }
};

/**
 * Récupérer toutes les salles d'un site
 */
exports.getAllSalleBySite = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des salles d'un site", {
      siteId: id,
      userId: req.user?.id,
    });

    const site = await Site.findByPk(id);
    if (!site) {
      logger.warn("⚠️ Site non trouvé", {
        siteId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Site non trouvé" });
    }

    const data = await Salle.findAll({
      where: { site_id: id },
      order: [["libelle", "ASC"]],
    });

    logger.info("✅ Salles du site récupérées", {
      siteId: id,
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur récupération salles du site:", {
      siteId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la récupération des salles",
      error: error.message,
    });
  }
};
