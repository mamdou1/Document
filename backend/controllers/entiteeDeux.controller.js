const { Fonction, EntiteeUn, EntiteeDeux, EntiteeTrois } = require("../models");

exports.createEntiteeDeux = async (req, res) => {
  try {
    // 1. Trouver le titre utilisé par les autres éléments
    const exemple = await EntiteeDeux.findOne({ attributes: ["titre"] });
    const titreGlobal = exemple.titre;

    // 2. Créer l'élément avec le titre récupéré
    const entitee_deux = await EntiteeDeux.create({
      ...req.body,
      titre: titreGlobal,
    });
    console.log("Création réussie:", entitee_deux);

    res.status(201).json(entitee_deux);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur création entitee_deux", error: err.message });
  }
};

// exports.createEntiteeDeuxTitre = async (req, res) => {
//   try {
//     const { titre } = req.body;

//     // Vérification basique
//     if (!titre) {
//       return res.status(400).json({ message: "le champs titre est requis" });
//     }

//     // Création
//     const titres = await EntiteeDeux.create({
//       titre,
//     });

//     res.status(201).json(titres);
//   } catch (err) {
//     console.error("❌ Erreur création titre:", err);
//     res.status(500).json({
//       message: "Erreur lors de la création du titre",
//       error: err.message,
//     });
//   }
// };

exports.getAllEntiteeDeux = async (req, res) => {
  try {
    const entitee_deux = await EntiteeDeux.findAll({
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un", // correspond à l'association définie
          attributes: ["id", "libelle"], // on peut limiter les colonnes
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          attributes: ["id", "libelle"],
        },
      ],
    });

    res.json(entitee_deux);
  } catch (err) {
    console.error("Erreur récupération entitee_deux:", err);
    res.status(500).json({
      message: "Erreur récupération entitee_deux",
      error: err.message,
    });
  }
};

exports.getEntiteeDeuxTitre = async (req, res) => {
  try {
    const entitee = await EntiteeDeux.findOne({ attributes: ["titre"] });

    if (!entitee) {
      return res
        .status(404)
        .json({ message: "Aucun titre trouvé pour EntiteeDeux" });
    }

    res.json({ titre: entitee.titre });
  } catch (err) {
    console.error("❌ Erreur getEntiteeDeuxTitre:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateEntiteeDeuxTitre = async (req, res) => {
  try {
    const { titre } = req.body;
    if (!titre) {
      return res.status(400).json({ message: "Le champ 'titre' est requis" });
    }

    // Vérifier l'existence d'enregistrements
    const count = await EntiteeDeux.count();

    if (count === 0) {
      // Création initiale si la table est vide
      await EntiteeDeux.create({
        titre: titre,
        code: "INIT",
        libelle: "Premier élément EntiteeDeux",
      });
      return res.json({
        message: "Titre initial créé pour EntiteeDeux",
        titre,
      });
    }

    // Mise à jour globale de la colonne titre
    await EntiteeDeux.update({ titre: titre }, { where: {} });

    res.json({
      message: "Titre mis à jour pour tous les éléments de EntiteeDeux",
      titre,
    });
  } catch (err) {
    console.error("❌ Erreur updateEntiteeDeuxTitre:", err);
    res.status(500).json({ message: err.message });
  }
};

// Filtre : Récupère les entitee_deux d'un service spécifique
exports.getEntiteeDeuxByEntiteeUn = async (req, res) => {
  try {
    const entitee_deux = await EntiteeDeux.findAll({
      where: { entitee_un_id: req.params.entiteeUnId },
    });
    res.json(entitee_deux);
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération entitee_deux",
      error: err.message,
    });
  }
};

// Récupère les fonctions liées à cette division [cite: 3, 6]
exports.getFunctionsByEntiteeDeux = async (req, res) => {
  try {
    const fonctions = await Fonction.findAll({
      where: { entitee_deux_id: req.params.id },
    });
    res.json(fonctions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateEntiteeDeux = async (req, res) => {
  try {
    console.log("Payload reçu:", req.body);
    const { id } = req.params;
    const payload = req.body;
    const ent = await EntiteeDeux.findByPk(id);

    if (!ent)
      return res.status(404).json({ message: "entitee_deux non trouvé" });
    await ent.update(payload);

    console.log("Payload reçu:", ent);

    const updated = await EntiteeDeux.findByPk(id, {
      include: [{ model: EntiteeUn, as: "entitee_un" }],
    });
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur mise à jour entitee_deux", error: err.message });
  }
};

exports.deleteEntiteeDeux = async (req, res) => {
  try {
    const { id } = req.params;
    const ent = await EntiteeDeux.findByPk(id);

    if (!ent)
      return res.status(404).json({ message: "entitee_deux non trouvé" });

    await ent.destroy();
    res.status(200).json({ message: "entitee_deux supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur supprision entitee_deux", error: err.message });
  }
};
