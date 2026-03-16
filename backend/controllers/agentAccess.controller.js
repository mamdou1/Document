// controllers/agentEntiteeAccess.controller.js
const {
  AgentEntiteeAccess,
  Agent,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

/**
 * Crée un ou plusieurs accès pour un agent
 * Accepte un objet ou un tableau d'objets
 */
exports.grant = async (req, res) => {
  const startTime = Date.now();

  try {
    const payloads = req.body;

    logger.info("📝 Tentative d'ajout d'accès pour agent(s)", {
      userId: req.user?.id,
      count: Array.isArray(payloads) ? payloads.length : 1,
    });

    // Vérifier que c'est un tableau
    if (!Array.isArray(payloads)) {
      logger.warn("⚠️ Payload doit être un tableau", {
        userId: req.user?.id,
      });
      return res
        .status(400)
        .json({ message: "Le payload doit être un tableau" });
    }

    // Valider chaque payload
    for (const p of payloads) {
      if (!p.agent_id) {
        logger.warn("⚠️ agent_id manquant", {
          payload: p,
          userId: req.user?.id,
        });
        return res.status(400).json({
          message: "agent_id est requis pour chaque accès",
        });
      }

      if (!p.entitee_un_id && !p.entitee_deux_id && !p.entitee_trois_id) {
        logger.warn("⚠️ Aucune entité spécifiée", {
          payload: p,
          userId: req.user?.id,
        });
        return res.status(400).json({
          message:
            "Au moins une entité (UN, DEUX, TROIS) est requise par accès",
        });
      }
    }

    // Insertion en masse
    const results = await AgentEntiteeAccess.bulkCreate(
      payloads.map((p) => ({
        agent_id: p.agent_id,
        entitee_un_id: p.entitee_un_id || null,
        entitee_deux_id: p.entitee_deux_id || null,
        entitee_trois_id: p.entitee_trois_id || null,
      })),
      {
        returning: true,
        validate: true,
      },
    );

    // Recharger avec les associations pour avoir les libellés
    const created = await AgentEntiteeAccess.findAll({
      where: { id: results.map((r) => r.id) },
      include: [
        { model: EntiteeUn, as: "entitee_un" },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
        },
      ],
    });

    logger.info("✅ Accès ajoutés avec succès", {
      count: created.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    for (const access of created) {
      await HistoriqueService.logCreate(req, "agentEntiteeAccess", access);
    }

    res.status(201).json(created);
  } catch (err) {
    logger.error("❌ Erreur grant access:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message,
    });
  }
};

// Récupérer les accès d'un agent
exports.agentAccesById = async (req, res) => {
  const startTime = Date.now();
  const { agentId } = req.params;

  try {
    logger.debug("🔍 Récupération des accès d'un agent", {
      agentId,
      userId: req.user?.id,
    });

    const rows = await AgentEntiteeAccess.findAll({
      where: { agent_id: agentId },
      include: [
        { model: EntiteeUn, as: "entitee_un", required: false },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
          required: false,
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
          required: false,
        },
      ],
    });

    logger.info("✅ Accès de l'agent récupérés", {
      agentId,
      count: rows.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(rows);
  } catch (err) {
    logger.error("❌ Erreur récupération accès agent:", {
      agentId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Révoquer un accès
exports.revoke = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de révocation d'un accès", {
      accessId: id,
      userId: req.user?.id,
    });

    if (!id) {
      logger.warn("⚠️ ID manquant pour révocation", {
        userId: req.user?.id,
      });
      return res.status(400).json({ message: "ID requis" });
    }

    const access = await AgentEntiteeAccess.findByPk(id);

    if (!access) {
      logger.warn("⚠️ Accès non trouvé pour révocation", {
        accessId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Accès non trouvé",
        id: id,
      });
    }

    const accessCopy = access.toJSON();

    const deleted = await AgentEntiteeAccess.destroy({
      where: { id },
    });

    if (deleted === 0) {
      logger.warn("⚠️ Aucun accès supprimé", {
        accessId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Aucun accès supprimé",
        id: id,
      });
    }

    logger.info("✅ Accès révoqué avec succès", {
      accessId: id,
      agentId: access.agent_id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "agentEntiteeAccess", accessCopy);

    res.json({
      success: true,
      message: "Accès révoqué avec succès",
      deleted: deleted,
      id: id,
    });
  } catch (err) {
    logger.error("❌ Erreur révocation accès:", {
      accessId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la révocation",
      error: err.message,
    });
  }
};

// Mettre à jour un accès
exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un accès", {
      accessId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldAccess = await AgentEntiteeAccess.findByPk(id);
    if (!oldAccess) {
      logger.warn("⚠️ Accès non trouvé pour mise à jour", {
        accessId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Accès introuvable" });
    }

    const oldCopy = oldAccess.toJSON();
    const { agent_id, entitee_un_id, entitee_deux_id, entitee_trois_id } =
      req.body;

    // Mise à jour
    if (agent_id !== undefined) oldAccess.agent_id = agent_id;
    if (entitee_un_id !== undefined) oldAccess.entitee_un_id = entitee_un_id;
    if (entitee_deux_id !== undefined)
      oldAccess.entitee_deux_id = entitee_deux_id;
    if (entitee_trois_id !== undefined)
      oldAccess.entitee_trois_id = entitee_trois_id;

    // Validation: au moins une entité
    if (
      !oldAccess.entitee_un_id &&
      !oldAccess.entitee_deux_id &&
      !oldAccess.entitee_trois_id
    ) {
      logger.warn("⚠️ Aucune entité spécifiée pour mise à jour", {
        accessId: id,
        userId: req.user?.id,
      });
      return res.status(400).json({
        message: "Au moins une entité doit être spécifiée",
      });
    }

    await oldAccess.save();

    // Recharger avec les associations
    const updated = await AgentEntiteeAccess.findByPk(id, {
      include: [
        { model: EntiteeUn, as: "entitee_un" },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
        },
      ],
    });

    logger.info("✅ Accès mis à jour avec succès", {
      accessId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(
      req,
      "agentEntiteeAccess",
      oldCopy,
      updated,
    );

    res.json(updated);
  } catch (error) {
    logger.error("❌ Erreur mise à jour accès:", {
      accessId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// Lister tous les accès
exports.list = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les accès", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await AgentEntiteeAccess.findAll({
      include: [
        { model: Agent, as: "agent" },
        { model: EntiteeUn, as: "entitee_un" },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
        },
      ],
    });

    logger.info("✅ Tous les accès récupérés", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "agentEntiteeAccess",
        resource_id: null,
        resource_identifier: "liste des accès",
        description: "Consultation de la liste des accès",
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
  } catch (err) {
    logger.error("❌ Erreur list accès:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
