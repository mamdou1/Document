const { Nature, Chapitre, Programme } = require("../models");

class NatureController {
  static async create(req, res) {
    try {
      console.log("📥 [Programme.create] BODY REÇU :", req.body);
      const { code_nature, libelle, chapitre, description } = req.body;

      if (!code_nature || !libelle || !chapitre)
        return res
          .status(400)
          .json({ message: "code_nature, libelle et chapitre requis" });

      const chapitreId = typeof chapitre === "object" ? chapitre.id : chapitre;
      console.log("🔎 Exercice ID résolu :", chapitreId);

      const ch = await Chapitre.findByPk(chapitre);
      if (!ch) return res.status(404).json({ message: "Chapitre non trouvé" });

      console.log("✅ Exercice trouvé :", {
        id: ch.id,
        libelle: ch.libelle,
      });

      const n = await Nature.create({
        code_nature,
        libelle,
        chapitre_id: chapitre,
        description,
      });

      return res.status(201).json(n);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(400).json({
          message: "codeNature déjà utilisé pour ce chapitre",
        });
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAll(req, res) {
    try {
      const nature = await Nature.findAll({
        include: [
          {
            model: Chapitre,
            attributes: ["id", "libelle"],
            as: "chapitre",
          },
        ],
      });
      res.status(200).json({ nature });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getNatureChapitre(req, res) {
    try {
      const natures = await Nature.findAll({
        where: { chapitre_id: req.params.chapitreId },
      });
      res.status(200).json(natures);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getOne(req, res) {
    try {
      const { id } = req.params;

      const n = await Nature.findByPk(id, {
        include: [
          {
            model: Chapitre,
            include: [Programme],
          },
        ],
      });

      if (!n) return res.status(404).json({ message: "Nature non trouvée" });
      return res.json(n);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;

      if (payload.chapitre) {
        const ch = await Chapitre.findByPk(payload.chapitre);
        if (!ch)
          return res.status(404).json({ message: "Chapitre non trouvé" });
      }

      const nature = await Nature.findByPk(id);
      if (!nature)
        return res.status(404).json({ message: "Nature non trouvée" });

      await nature.update({
        code_nature: payload.codeNature ?? nature.code_nature,
        libelle: payload.libelle ?? nature.libelle,
        description: payload.description ?? nature.description,
        chapitre_id: payload.chapitre ?? nature.chapitre_id,
      });

      const updated = await Nature.findByPk(id, {
        include: [{ model: Chapitre, include: [Programme] }],
      });

      return res.json(updated);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(400).json({
          message: "codeNature déjà utilisé pour ce chapitre",
        });
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const nature = await Nature.findByPk(id);
      if (!nature)
        return res.status(404).json({ message: "Nature non trouvée" });

      await nature.destroy();
      return res.json({ message: "Nature supprimée" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = NatureController;
