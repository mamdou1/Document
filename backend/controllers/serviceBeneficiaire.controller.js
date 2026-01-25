const { ServiceBeneficiaire } = require("../models");

exports.createService = async (req, res) => {
  try {
    const { codeService, libelle, sigle, adresse } = req.body;

    if (!codeService || !libelle || !sigle || !adresse)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const service = await ServiceBeneficiaire.create({
      codeService,
      libelle,
      sigle,
      adresse,
    });

    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Impossible d'ajouter ce service bénéficiaire",
    });
  }
};

exports.getService = async (req, res) => {
  try {
    const serviceBeneficiaire = await ServiceBeneficiaire.findAll();
    res.status(200).json({ serviceBeneficiaire });
  } catch (err) {
    res.status(500).json({
      message: "Impossible de récupérer les services bénéficiaires",
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceBeneficiaire.findByPk(id);
    if (!service)
      return res
        .status(404)
        .json({ message: "Service bénéficiaire introuvable" });

    res.status(200).json({ service });
  } catch (err) {
    res.status(500).json({
      message: "Impossible de récupérer le service bénéficiaire",
    });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceBeneficiaire.findByPk(id);
    if (!service)
      return res
        .status(404)
        .json({ message: "Service bénéficiaire introuvable" });

    await service.update(req.body);
    res.status(200).json({ service });
  } catch (err) {
    res.status(500).json({
      message: "Impossible de mettre à jour le service bénéficiaire",
    });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceBeneficiaire.findByPk(id);
    if (!service)
      return res
        .status(404)
        .json({ message: "Service bénéficiaire introuvable" });

    await service.destroy();
    res.status(200).json({ message: "Service supprimé" });
  } catch (err) {
    res.status(500).json({
      message: "Impossible de supprimer le service bénéficiaire",
    });
  }
};
