const { Exercice, Programme } = require("../models");

class ExerciceController {
  static async create(req, res) {
    try {
      const { annee } = req.body;
      if (!annee) return res.status(400).json({ message: "annee est requis" });

      const ex = await Exercice.create({ annee });
      return res.status(201).json(ex);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(400).json({ message: "Exercice déjà existant" });
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAll(req, res) {
    try {
      const exercices = await Exercice.findAll({
        order: [["annee", "ASC"]],
      });
      return res.json(exercices);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getOne(req, res) {
    try {
      const { id } = req.params;
      const ex = await Exercice.findByPk(id);
      if (!ex) return res.status(404).json({ message: "Exercice non trouvé" });
      return res.json(ex);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;

      const ex = await Exercice.findByPk(id);
      if (!ex) return res.status(404).json({ message: "Exercice non trouvé" });

      await ex.update(payload);
      return res.json(ex);
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

      // Vérifier si des programmes sont liés
      const progs = await Programme.findOne({ where: { exercice_id: id } });
      if (progs)
        return res.status(409).json({
          message:
            "Impossible de supprimer : des programmes existent pour cet exercice",
        });

      const deleted = await Exercice.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: "Exercice non trouvé" });

      return res.json({ message: "Exercice supprimé" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = ExerciceController;
