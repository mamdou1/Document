const { Chapitre, Programme } = require("../models");

class ChapitreController {
  static async create(req, res) {
    try {
      console.log("📥 BODY chapitre :", req.body);
      const { code_chapitre, libelle, programme, description } = req.body;

      if (!code_chapitre || !libelle || !programme) {
        return res.status(400).json({
          message: "codeChapitre, libelle et programme requis",
        });
      }

      const p = await Programme.findByPk(programme);
      if (!p) return res.status(404).json({ message: "Programme non trouvé" });
      console.log("✅ Programme créé :", p.toJSON());

      const chap = await Chapitre.create({
        code_chapitre,
        libelle,
        programme_id: programme,
        description,
      });

      return res.status(201).json(chap);
    } catch (err) {
      // contrainte UNIQUE MySQL
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          message: "codeChapitre déjà utilisé pour ce programme",
        });
      }
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAll(req, res) {
    try {
      const chapitre = await Chapitre.findAll({
        include: [
          {
            model: Programme,
            attributes: ["id", "libelle"],
            as: "programme",
          },
        ],
      });

      res.status(200).json({ chapitre });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getChapitreByProgramme(req, res) {
    try {
      const chapitres = await Chapitre.findAll({
        where: { programme_id: req.params.programmeId },
      });

      res.status(200).json(chapitres);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getOne(req, res) {
    try {
      const { id } = req.params;

      const chap = await Chapitre.findByPk(id, {
        include: [
          {
            model: Programme,
          },
        ],
      });

      if (!chap)
        return res.status(404).json({ message: "Chapitre non trouvé" });

      return res.json(chap);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;

      if (payload.programme) {
        const p = await Programme.findByPk(payload.programme);
        if (!p)
          return res.status(404).json({ message: "Programme non trouvé" });
      }

      const chap = await Chapitre.findByPk(id);
      if (!chap)
        return res.status(404).json({ message: "Chapitre non trouvé" });

      await chap.update({
        code_chapitre: payload.codeChapitre ?? chap.code_chapitre,
        libelle: payload.libelle ?? chap.libelle,
        description: payload.description ?? chap.description,
        programme_id: payload.programme ?? chap.programme_id,
      });

      const updated = await Chapitre.findByPk(id, {
        include: [{ model: Programme }],
      });

      return res.json(updated);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          message: "codeChapitre déjà utilisé pour ce programme",
        });
      }
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const chap = await Chapitre.findByPk(id);
      if (!chap)
        return res.status(404).json({ message: "Chapitre non trouvé" });

      await chap.destroy();

      return res.json({ message: "Chapitre supprimé" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = ChapitreController;
