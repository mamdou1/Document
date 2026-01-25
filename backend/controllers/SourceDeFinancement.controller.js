const { SourceDeFinancement } = require("../models");

exports.createSourceDeFinancement = async (req, res) => {
  try {
    console.log("📥 BODY FOURNISSEUR :", req.body);

    const { libelle } = req.body;
    if (!libelle) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const source = await SourceDeFinancement.create({
      libelle,
    });

    console.log("✅ SourceDeFinancement créé :", source.toJSON());

    res.status(201).json(source);
  } catch (err) {
    console.error("🔥 createSourceDeFinancement error :", err);
    res
      .status(500)
      .json({ message: "Impossible d'ajouter ce source de financement" });
  }
};

exports.getSourceDeFinancement = async (req, res) => {
  try {
    const source = await SourceDeFinancement.findAll();
    console.log("🧱 Programme à créer :", source);
    res.status(200).json({ source });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Impossible de récupérer les sources de financement" });
  }
};

exports.getSourceDeFinancementById = async (req, res) => {
  try {
    const { id } = req.params;

    const source = await SourceDeFinancement.findByPk(id);
    if (!source) {
      return res
        .status(404)
        .json({ message: "SourceDeFinancement introuvable" });
    }

    res.status(200).json({ source });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Impossible de récupérer le source" });
  }
};

exports.updateSourceDeFinancement = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const source = await SourceDeFinancement.findByPk(id);
    if (!source) {
      return res
        .status(404)
        .json({ message: "SourceDeFinancement introuvable" });
    }

    await source.update({
      nif: payload.libelle ?? source.libelle,
    });

    res.status(200).json({ source });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Impossible de mettre à jour le source de financement",
    });
  }
};

exports.deleteSourceDeFinancement = async (req, res) => {
  try {
    const { id } = req.params;

    const source = await SourceDeFinancement.findByPk(id);
    if (!source) {
      return res
        .status(404)
        .json({ message: "SourceDeFinancement introuvable" });
    }

    await source.destroy();
    res.status(200).json({ message: "SourceDeFinancement supprimé" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Impossible de supprimer le source de financement" });
  }
};
