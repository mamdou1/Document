const { Programme, Exercice } = require("../models");

class ProgrammeController {
  // static async create(req, res) {
  //   try {
  //     const { codeProgramme, libelle, exercice, description } = req.body;

  //     if (!codeProgramme || !libelle || !exercice)
  //       return res.status(400).json({
  //         message: "codeProgramme, libelle et exercice sont requis",
  //       });

  //     const exerciceId = typeof exercice === "object" ? exercice.id : exercice;
  //     const ex = await Exercice.findByPk(exerciceId);
  //     if (!ex) return res.status(404).json({ message: "Exercice non trouvé" });
  //     console.log(exerciceId);

  //     const prog = await Programme.create({
  //       code_programme: codeProgramme,
  //       libelle,
  //       exercice_id: exercice,
  //       description,
  //     });

  //     return res.status(201).json(prog);
  //   } catch (err) {
  //     if (err.name === "SequelizeUniqueConstraintError")
  //       return res.status(400).json({
  //         message: "codeProgramme déjà utilisé pour cet exercice",
  //       });

  //     console.error(err);
  //     return res.status(500).json({ message: "Erreur serveur" });
  //   }
  // }

  static async create(req, res) {
    try {
      console.log("📥 [Programme.create] BODY REÇU :", req.body);

      const { code_programme, libelle, exercice, description } = req.body;

      if (!code_programme || !libelle || !exercice) {
        console.warn("⚠️ Champs manquants", {
          code_programme,
          libelle,
          exercice,
        });
        return res.status(400).json({
          message: "codeProgramme, libelle et exercice sont requis",
        });
      }

      // Normalisation de l'id exercice
      const exerciceId = typeof exercice === "object" ? exercice.id : exercice;
      console.log("🔎 Exercice ID résolu :", exerciceId);

      const ex = await Exercice.findByPk(exerciceId);
      if (!ex) {
        console.warn("❌ Exercice introuvable :", exerciceId);
        return res.status(404).json({ message: "Exercice non trouvé" });
      }

      console.log("✅ Exercice trouvé :", {
        id: ex.id,
        annee: ex.annee,
      });

      const payload = {
        code_programme,
        libelle,
        exercice_id: exerciceId, // ⚠️ IMPORTANT
        description,
      };

      //console.log("🧱 Programme à créer :", payload);

      const prog = await Programme.create(payload);

      console.log("🎉 Programme créé avec succès :", prog.toJSON());

      return res.status(201).json(prog);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        console.error("🚫 Contrainte UNIQUE violée :", err.errors);
        return res.status(400).json({
          message: "codeProgramme déjà utilisé pour cet exercice",
        });
      }

      console.error("🔥 Erreur Programme.create :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAll(req, res) {
    try {
      const programme = await Programme.findAll({
        include: {
          model: Exercice,
          as: "exercice",
          attributes: ["annee"],
        },
      });

      res.status(200).json({ programme });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getOne(req, res) {
    try {
      const { id } = req.params;

      const prog = await Programme.findByPk(id, {
        include: [Exercice],
      });

      if (!prog)
        return res.status(404).json({ message: "Programme non trouvé" });

      return res.json(prog);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;

      const prog = await Programme.findByPk(id);
      if (!prog)
        return res.status(404).json({ message: "Programme non trouvé" });

      await prog.update(req.body);
      return res.json(prog);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(400).json({
          message: "codeProgramme déjà utilisé pour cet exercice",
        });

      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const prog = await Programme.findByPk(id);
      if (!prog)
        return res.status(404).json({ message: "Programme non trouvé" });

      await prog.destroy();
      return res.json({ message: "Programme supprimé" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = ProgrammeController;
