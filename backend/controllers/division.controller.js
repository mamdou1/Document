const { Division, Fonction, Service, Section } = require("../models");

exports.createDivision = async (req, res) => {
  try {
    const division = await Division.create(req.body);
    res.status(201).json(division);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur création division", error: err.message });
  }
};

exports.getAllDivision = async (req, res) => {
  try {
    const divisions = await Division.findAll({
      include: [
        {
          model: Service,
          as: "service", // correspond à l'association définie
          attributes: ["id", "libelle"], // on peut limiter les colonnes
        },
        {
          model: Section,
          as: "sections",
          attributes: ["id", "libelle"],
        },
      ],
    });

    res.json(divisions);
  } catch (err) {
    console.error("Erreur récupération divisions:", err);
    res
      .status(500)
      .json({ message: "Erreur récupération divisions", error: err.message });
  }
};

// Filtre : Récupère les divisions d'un service spécifique
exports.getDivisionsByService = async (req, res) => {
  try {
    const divisions = await Division.findAll({
      where: { service_id: req.params.serviceId },
    });
    res.json(divisions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération divisions", error: err.message });
  }
};

// Récupère les fonctions liées à cette division [cite: 3, 6]
exports.getFunctionsByDivision = async (req, res) => {
  try {
    const fonctions = await Fonction.findAll({
      where: { division_id: req.params.id },
    });
    res.json(fonctions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const div = await Division.findByPk(id);

    if (!div) return res.status(404).json({ message: "Division non trouvé" });
    await div.update({
      libelle: payload.libelle ?? div.libelle,
    });

    const updated = await Division.findByPk(id, {
      include: [{ model: Service }],
    });
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur mise à jour divisions", error: err.message });
  }
};

exports.deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const div = await Division.findByPk(id);

    if (!div) return res.status(404).json({ message: "Division non trouvé" });

    await div.destroy();
    res.status(200).json({ message: "Division supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur supprision divisions", error: err.message });
  }
};
