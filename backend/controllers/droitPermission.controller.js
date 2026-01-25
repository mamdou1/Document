const { Droit, Permission } = require("../models");

exports.getLibellePermission = async (req, res) => {
  try {
    const droit = await Droit.findByPk(req.params.id, {
      include: {
        model: Permission,
        through: { attributes: [] },
      },
    });

    if (!droit) return res.status(404).json({ message: "Droit introuvable" });

    res.json(droit.Permissions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.updateLibellePermission = async (req, res) => {
  console.log("Donner envoyer par le frontend : ", req.body);

  try {
    const { permissions } = req.body; // ✅ CORRIGÉ
    console.log("Donner reçu par le backend : ", permissions);

    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "permissions doit être un tableau" });
    }

    const droit = await Droit.findByPk(req.params.id);
    if (!droit) return res.status(404).json({ message: "Droit introuvable" });
    console.log("Id de droit reçu par le backend : ", droit);

    await droit.setPermissions(permissions); // ✅ OK

    res.json({ message: "Permissions mises à jour" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
