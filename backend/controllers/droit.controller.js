const { Droit, Permission, Agent } = require("../models");

class DroitController {
  static async create(req, res) {
    try {
      const { libelle } = req.body;
      if (!libelle)
        return res.status(400).json({ message: "Le libelle est requis" });

      const dr = await Droit.create({ libelle });
      return res.status(201).json(dr);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(400).json({ message: "Droit déjà existant" });
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAll(req, res) {
    try {
      const droits = await Droit.findAll({
        order: [["libelle", "ASC"]],
        include: [
          {
            model: Permission,
            through: { attributes: [] }, // cache droit_permission
            attributes: ["id", "resource", "action"],
          },
        ],
      });

      return res.json(droits);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
  static async getOne(req, res) {
    try {
      const { id } = req.params;
      const dr = await Droit.findByPk(id, {
        include: [
          {
            model: Permission,
            through: { attributes: [] }, // cache la table pivot
            attributes: ["id", "resource", "action"],
          },
        ],
      });
      if (!dr) return res.status(404).json({ message: "Exercice non trouvé" });
      return res.json(dr);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;

      const dr = await Droit.findByPk(id);
      if (!dr) return res.status(404).json({ message: "Exercice non trouvé" });

      await dr.update(payload);
      return res.json(dr);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(400).json({ message: "Valeur unique violée" });
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Droit.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: "Droit non trouvé" });

      return res.json({ message: "Droit supprimé" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAgentByDroit(req, res) {
    try {
      const { id } = req.params;

      const droit = await Droit.findByPk(id, {
        include: [
          {
            model: Agent,
            as: "agents", // 👈 alias défini dans Droit.associate
          },
        ],
      });

      if (!droit) {
        return res.status(404).json({ message: "Droit ou profil non trouvé" });
      }

      return res.status(200).json(droit.agents);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = DroitController;
