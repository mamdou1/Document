const { HistoriqueLog, Agent, Droit, Fonction } = require("../models");
const { Op } = require("sequelize");

class HistoriqueController {
  static async list(req, res) {
    try {
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
                attributes: ["id", "libelle"], // ✅ récupérer id + libelle du droit
              },
              {
                model: Fonction,
                as: "fonction_details",
                attributes: ["id", "libelle"], // ✅ récupérer id + libelle de la fonction
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset,
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
      console.error("❌ Historique list error:", err);
      res.status(500).json({ message: "Erreur chargement historique" });
    }
  }

  static async detail(req, res) {
    try {
      const log = await HistoriqueLog.findByPk(req.params.id, {
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
        return res.status(404).json({ message: "Log introuvable" });
      }

      res.json(log);
    } catch (err) {
      console.error("❌ Historique detail error:", err);
      res.status(500).json({ message: "Erreur chargement log" });
    }
  }
}

module.exports = HistoriqueController;
