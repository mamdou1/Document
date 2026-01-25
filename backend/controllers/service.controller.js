const { Service, Fonction } = require("../models");

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur création service", error: err.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération services", error: err.message });
  }
};

// Récupère les fonctions liées directement à ce service [cite: 3, 5]
exports.getFunctionsByService = async (req, res) => {
  try {
    const fonctions = await Fonction.findAll({
      where: { service_id: req.params.id },
    });
    res.json(fonctions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const serv = await Service.findByPk(id);
    if (!serv) return res.status(404).json({ message: "Service non trouvé" });

    await serv.update(payload);
    res.status(200).json(serv);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur mise à jour services", error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const serv = await Service.findByPk(id);

    if (!serv) return res.status(404).json({ message: "Service non trouvé" });

    await serv.destroy();
    res.status(200).json({ message: "Service supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur suppresion services", error: err.message });
  }
};
