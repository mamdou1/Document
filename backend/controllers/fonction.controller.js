const { Fonction } = require("../models");

exports.createFonction = async (req, res) => {
  try {
    // Le body contiendra soit service_id, division_id ou section_id
    const fonction = await Fonction.create(req.body);
    res.status(201).json(fonction);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur création fonction", error: err.message });
  }
};

exports.getAllFonctions = async (req, res) => {
  try {
    const fonctions = await Fonction.findAll();
    res.json(fonctions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateFonctions = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const fonc = await Fonction.findByPk(id);

    if (!fonc) return res.status(404).json({ message: "Fonction non trouvé" });
    await fonc.update(payload);

    res.status(200).json(fonc);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur mise à jour fonctions", error: err.message });
  }
};

exports.deleteFonction = async (req, res) => {
  try {
    const { id } = req.params;
    const fonc = await Fonction.findByPk(id);

    if (!fonc) return res.status(404).json({ message: "Service non trouvé" });

    await fonc.destroy();
    res.status(200).json({ message: "Fonction supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur supprision fonctions", error: err.message });
  }
};
