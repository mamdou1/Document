const { Fonction, EntiteeUn, EntiteeDeux, EntiteeTrois } = require("../models");

exports.createEntiteeTrois = async (req, res) => {
  try {
    // 1. Trouver le titre utilisé par les autres éléments
    const exemple = await EntiteeTrois.findOne({ attributes: ["titre"] });
    const titreGlobal = exemple.titre;

    // 2. Créer l'élément avec le titre récupéré
    const entitee_trois = await EntiteeTrois.create({
      ...req.body,
      titre: titreGlobal,
    });
    console.log("Création réussie:", entitee_trois);

    res.status(201).json(entitee_trois);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur création EntiteeTrois", error: err.message });
  }
};

// exports.createEntiteeTroisTitre = async (req, res) => {
//   try {
//     const { titre } = req.body;

//     // Vérification basique
//     if (!titre) {
//       return res.status(400).json({ message: "le champs titre est requis" });
//     }

//     // Création
//     const titres = await EntiteeTrois.create({
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

exports.getAllEntiteeTrois = async (req, res) => {
  try {
    const entitee_trois = await EntiteeTrois.findAll({
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle"],
            },
          ],
        },
      ],
    });

    res.json(entitee_trois);
  } catch (err) {
    console.error("Erreur récupération EntiteeTrois:", err);
    res.status(500).json({
      message: "Erreur récupération EntiteeTrois",
      error: err.message,
    });
  }
};

exports.getEntiteeTroisTitre = async (req, res) => {
  try {
    const entitee = await EntiteeTrois.findOne({ attributes: ["titre"] });
    if (!entitee) {
      return res
        .status(404)
        .json({ message: "Aucun titre trouvé pour EntiteeTrois" });
    }

    res.json({ titre: entitee.titre });
  } catch (err) {
    console.error("❌ Erreur getEntiteeTroisTitre:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateEntiteeTroisTitre = async (req, res) => {
  try {
    const { titre } = req.body;
    if (!titre) {
      return res.status(400).json({ message: "Le champ 'titre' est requis" });
    }

    // Vérifier l'existence d'enregistrements
    const count = await EntiteeTrois.count();

    if (count === 0) {
      // Création initiale si la table est vide
      await EntiteeTrois.create({
        titre: titre,
        code: "INIT",
        libelle: "Premier élément EntiteeTrois",
      });
      return res.json({
        message: "Titre initial créé pour EntiteeTrois",
        titre,
      });
    }

    // Mise à jour globale de la colonne titre
    await EntiteeTrois.update({ titre: titre }, { where: {} });

    res.json({
      message: "Titre mis à jour pour tous les éléments de EntiteeTrois",
      titre,
    });
  } catch (err) {
    console.error("❌ Erreur updateEntiteeTroisTitre:", err);
    res.status(500).json({ message: err.message });
  }
};

// Filtre : Récupère les EntiteeTrois d'une EntiteeDeux spécifique
exports.getEntiteeTroisByEntiteeDeux = async (req, res) => {
  try {
    const entitee_trois = await EntiteeTrois.findAll({
      where: { entitee_deux_id: req.params.entiteeDeuxId },
    });
    res.json(entitee_trois);
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération EntiteeTrois",
      error: err.message,
    });
  }
};

// Récupère les fonctions liées à cette entitee_trois [cite: 3, 6]
exports.getFunctionsByEntiteeTrois = async (req, res) => {
  try {
    const fonctions = await Fonction.findAll({
      where: { entitee_trois_id: req.params.id },
    });
    res.json(fonctions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateEntiteeTrois = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const ent = await EntiteeTrois.findByPk(id);

    if (!ent)
      return res.status(404).json({ message: "entitee_trois non trouvé" });

    await ent.update(payload);

    const updated = await EntiteeTrois.findByPk(id, {
      include: [{ model: EntiteeDeux, as: "entitee_deux" }],
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Erreur mise à jour entitee_trois",
      error: err.message,
    });
  }
};

exports.deleteEntiteeTrois = async (req, res) => {
  try {
    const { id } = req.params;
    const ent = await EntiteeTrois.findByPk(id);

    if (!ent)
      return res.status(404).json({ message: "EntiteeDeux non trouvé" });

    await ent.destroy();
    res.status(200).json({ message: "EntiteeTrois supprimé" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur supprsion EntiteeTrois", error: err.message });
  }
};
