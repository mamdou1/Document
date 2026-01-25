const { Fournisseur } = require("../models");

exports.createFournisseur = async (req, res) => {
  try {
    console.log("📥 BODY FOURNISSEUR :", req.body);

    const { NIF, raisonSocial, sigle, adresse, numero, secteurActivite } =
      req.body;

    if (
      !NIF ||
      !raisonSocial ||
      !sigle ||
      !adresse ||
      !numero ||
      !secteurActivite
    ) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const fournisseur = await Fournisseur.create({
      NIF,
      raisonSocial,
      sigle,
      adresse,
      numero,
      secteurActivite,
    });

    console.log("✅ Fournisseur créé :", fournisseur.toJSON());

    res.status(201).json(fournisseur);
  } catch (err) {
    console.error("🔥 createFournisseur error :", err);
    res.status(500).json({ message: "Impossible d'ajouter ce fournisseur" });
  }
};

exports.getFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findAll();
    console.log("🧱 Programme à créer :", fournisseur);
    res.status(200).json({ fournisseur });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Impossible de récupérer les fournisseurs" });
  }
};

exports.getFournisseurById = async (req, res) => {
  try {
    const { id } = req.params;

    const fournisseur = await Fournisseur.findByPk(id);
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur introuvable" });
    }

    res.status(200).json({ fournisseur });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Impossible de récupérer le fournisseur" });
  }
};

exports.updateFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const fournisseur = await Fournisseur.findByPk(id);
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur introuvable" });
    }

    await fournisseur.update({
      nif: payload.NIF ?? fournisseur.nif,
      raison_social: payload.raisonSocial ?? fournisseur.raison_social,
      sigle: payload.sigle ?? fournisseur.sigle,
      adresse: payload.adresse ?? fournisseur.adresse,
      numero: payload.numero ?? fournisseur.numero,
      secteurActivite: payload.secteurActivite ?? fournisseur.secteurActivite,
    });

    res.status(200).json({ fournisseur });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Impossible de mettre à jour le fournisseur" });
  }
};

exports.deleteFournisseur = async (req, res) => {
  try {
    const { id } = req.params;

    const fournisseur = await Fournisseur.findByPk(id);
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur introuvable" });
    }

    await fournisseur.destroy();
    res.status(200).json({ message: "Fournisseur supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Impossible de supprimer le fournisseur" });
  }
};
