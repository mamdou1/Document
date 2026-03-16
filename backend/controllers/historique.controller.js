// controllers/historique.controller.js
const { HistoriqueLog, Agent, Droit, Fonction } = require("../models");
const { Op } = require("sequelize");
const logger = require("../config/logger.config");

class HistoriqueController {
  static async list(req, res) {
    const startTime = Date.now();

    try {
      logger.debug("🔍 Récupération de l'historique", {
        userId: req.user?.id,
        query: req.query,
      });

      const {
        page = 1,
        limit = 20,
        agent_id,
        action,
        resource,
        date_from,
        date_to,
      } = req.query;

      const where = {};

      if (agent_id) where.agent_id = agent_id;
      if (action) where.action = action;
      if (resource) where.resource = resource;

      if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at[Op.gte] = new Date(date_from);
        if (date_to) where.created_at[Op.lte] = new Date(date_to);
      }

      const offset = (page - 1) * limit;

      const { rows, count } = await HistoriqueLog.findAndCountAll({
        where,
        include: [
          {
            model: Agent,
            as: "agent",
            attributes: [
              "id",
              "nom",
              "prenom",
              "telephone",
              "droit_id",
              "fonction_id",
            ],
            include: [
              {
                model: Droit,
                as: "droit",
                attributes: ["id", "libelle"],
              },
              {
                model: Fonction,
                as: "fonction_details",
                attributes: ["id", "libelle"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset,
      });

      logger.info("✅ Historique récupéré", {
        count: rows.length,
        total: count,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      logger.error("❌ Historique list error:", {
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      res.status(500).json({ message: "Erreur chargement historique" });
    }
  }

  static async detail(req, res) {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      logger.debug("🔍 Récupération d'un détail d'historique", {
        logId: id,
        userId: req.user?.id,
      });

      const log = await HistoriqueLog.findByPk(id, {
        include: [
          {
            model: Agent,
            as: "agent",
            attributes: [
              "id",
              "nom",
              "prenom",
              "telephone",
              "droit_id",
              "fonction_id",
            ],
          },
        ],
      });

      if (!log) {
        logger.warn("⚠️ Log introuvable", {
          logId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: "Log introuvable" });
      }

      logger.info("✅ Détail de l'historique récupéré", {
        logId: id,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      res.json(log);
    } catch (err) {
      logger.error("❌ Historique detail error:", {
        logId: id,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      res.status(500).json({ message: "Erreur chargement log" });
    }
  }
}

module.exports = HistoriqueController;
