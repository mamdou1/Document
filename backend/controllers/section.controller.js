const { Section, Fonction, Service, Division } = require("../models");

exports.createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur création section", error: err.message });
  }
};

exports.getAllSection = async (req, res) => {
  try {
    const sections = await Section.findAll({
      include: [
        {
          model: Division,
          as: "division",
          attributes: ["id", "libelle"],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "libelle"],
            },
          ],
        },
      ],
    });

    res.json(sections);
  } catch (err) {
    console.error("Erreur récupération sections:", err);
    res
      .status(500)
      .json({ message: "Erreur récupération sections", error: err.message });
  }
};

// Filtre : Récupère les sections d'une division spécifique
exports.getSectionsByDivision = async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { division_id: req.params.divisionId },
    });
    res.json(sections);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération sections", error: err.message });
  }
};

// Récupère les fonctions liées à cette section [cite: 3, 6]
exports.getFunctionsBySection = async (req, res) => {
  try {
    const fonctions = await Fonction.findAll({
      where: { section_id: req.params.id },
    });
    res.json(fonctions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const sec = await Section.findByPk(id);

    if (!sec) return res.status(404).json({ message: "Section non trouvé" });

    await sec.update({
      libelle: payload.libelle ?? sec.libelle,
    });

    const updated = await Section.findByPk(id, {
      include: [{ model: Division }],
    });
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur mise à jour sections", error: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const sec = await Section.findByPk(id);

    if (!sec) return res.status(404).json({ message: "Division non trouvé" });

    await sec.destroy();
    res.status(200).json({ message: "Section supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur supprsion sections", error: err.message });
  }
};
