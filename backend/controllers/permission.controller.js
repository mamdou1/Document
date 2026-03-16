// controllers/permission.controller.js
const { Permission } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.getAllPermissions = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de toutes les permissions", {
      userId: req.user?.id,
    });

    const permissions = await Permission.findAll({
      order: [
        ["resource", "ASC"],
        ["action", "ASC"],
      ],
    });

    logger.info("✅ Permissions récupérées", {
      count: permissions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "permission",
        resource_id: null,
        resource_identifier: "liste des permissions",
        description: "Consultation de la liste des permissions",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: permissions.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json(permissions);
  } catch (err) {
    logger.error("❌ Erreur getAllPermissions:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};
