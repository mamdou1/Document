const {
  TypeDocument,
  MetaField,
  Pieces,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  sequelize,
} = require("../models");

// exports.create = async (req, res) => {
//   try {
//     const {
//       code,
//       nom,
//       //division_id,
//       entitee_un_id,
//       entitee_deux_id,
//       entitee_trois_id,
//     } = req.body;

//     // Logique optionnelle : On s'assure qu'au moins l'Entité 1 est présente
//     if (!entitee_un_id) {
//       return res
//         .status(400)
//         .json({ message: "L'entité de niveau 1 est obligatoire." });
//     }

//     const data = await TypeDocument.create({
//       code,
//       nom,
//       //division_id, // Si tu utilises toujours les divisions
//       entitee_un_id,
//       entitee_deux_id: entitee_deux_id || null, // On accepte le vide si l'utilisateur s'arrête au niveau 1
//       entitee_trois_id: entitee_trois_id || null, // Idem pour le niveau 2
//     });

//     res.status(201).json(data);
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     // 1. Extraire uniquement les champs scalaires (pas les objets/tableaux)
//     // Assurez-vous d'utiliser les noms exacts de vos colonnes en BD
//     const {
//       nom,
//       code,
//       entitee_un_id,
//       entitee_deux_id,
//       entitee_trois_id,
//       division_id,
//     } = req.body;

//     const [updated] = await TypeDocument.update(
//       {
//         nom,
//         code,
//         entitee_un_id,
//         entitee_deux_id,
//         entitee_trois_id,
//         division_id,
//       },
//       { where: { id: req.params.id } },
//     );

//     if (updated === 0) {
//       return res.status(404).json({
//         message:
//           "Aucun document trouvé avec cet ID ou aucune modification apportée",
//       });
//     }

//     res.json({ success: true, message: "Mise à jour réussie" });
//   } catch (e) {
//     console.error("Erreur Update:", e);
//     res.status(500).json({ message: e.message });
//   }
// };

// exports.getAll = async (req, res) => {
//   try {
//     const data = await TypeDocument.findAll({
//       include: [
//         { model: MetaField, as: "metaFields" },
//         {
//           model: Division,
//           as: "division",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: EntiteeUn,
//           as: "entitee_un",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: EntiteeDeux,
//           as: "entitee_deux",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: EntiteeTrois,
//           as: "entitee_trois",
//           attributes: ["id", "libelle"],
//         },
//         {
//           model: Pieces,
//           as: "pieces", // L'alias défini dans votre association belongsToMany
//           attributes: ["id", "libelle", "code_pieces"],
//           through: { attributes: [] }, // On ne veut pas les colonnes de la table pivot ici
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     // Formatage identique à votre ancien modèle
//     // Dans ton controller TypeDocument.getAll
//     const formatted = data.map((td) => {
//       // Logique pour trouver l'entité la plus précise rattachée
//       const entiteeConcernee =
//         td.entitee_trois || td.entitee_deux || td.entitee_un || td.division; // Fallback sur division si les autres sont nulles

//       return {
//         id: td.id,
//         code: td.code,
//         nom: td.nom,
//         // On ajoute ce champ pour simplifier le travail du frontend
//         structure_libelle: entiteeConcernee
//           ? entiteeConcernee.libelle
//           : "Non assigné",
//         // On garde les objets complets au cas où
//         entitee_un: td.entitee_un,
//         entitee_deux: td.entitee_deux,
//         entitee_trois: td.entitee_trois,
//         division: td.division,
//         metaFields: td.metaFields || [],
//         pieces: (td.pieces || []).map((p) => ({
//           id: p.id,
//           libelle: p.libelle,
//           code_pieces: p.code_pieces,
//         })),
//         createdAt: td.createdAt,
//         updatedAt: td.updatedAt,
//       };
//     });

//     res.json({ typeDocument: formatted }); // On renvoie un objet avec la clé typeDocument
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: e.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const data = await TypeDocument.findByPk(req.params.id, {
//       include: [
//         { model: EntiteeUn },
//         { model: EntiteeDeux },
//         { model: EntiteeTrois },
//         { model: Division },
//         { model: MetaField },
//       ],
//     });

//     if (!data) return res.status(404).json({ message: "Not found" });
//     res.json(data);
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { code, nom, entites_un_id, entites_deux_id, entites_trois_id } =
      req.body;

    // 1. Créer le document
    const td = await TypeDocument.create({ code, nom }, { transaction: t });

    // 2. Lier aux entités (Sequelize crée automatiquement ces méthodes set...)
    if (entites_un_id)
      await td.setEntites_un(entites_un_id, { transaction: t });
    if (entites_deux_id)
      await td.setEntites_deux(entites_deux_id, { transaction: t });
    if (entites_trois_id)
      await td.setEntites_trois(entites_trois_id, { transaction: t });

    await t.commit();
    res.status(201).json(td);
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await TypeDocument.findAll({
      include: [
        { model: MetaField, as: "metaFields" },
        // Utilisation des alias définis dans le modèle (Pluriel)
        {
          model: EntiteeUn,
          as: "entites_un",
          attributes: ["id", "libelle"],
          through: { attributes: [] }, // Cache la table pivot dans le JSON
        },
        {
          model: EntiteeDeux,
          as: "entites_deux",
          attributes: ["id", "libelle"],
          through: { attributes: [] },
        },
        {
          model: EntiteeTrois,
          as: "entites_trois",
          attributes: ["id", "libelle"],
          through: { attributes: [] },
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Optionnel : Tu peux garder ton formatage, mais adapte-le au multi-entités
    const formatted = data.map((td) => {
      const plain = td.get({ plain: true });

      return {
        ...plain,
        // On peut créer un libellé résumé pour le front si besoin
        structure_resume:
          [
            ...(plain.entites_un || []),
            ...(plain.entites_deux || []),
            ...(plain.entites_trois || []),
          ]
            .map((e) => e.libelle)
            .join(", ") || "N/A",
      };
    });

    res.json({ typeDocument: formatted });
  } catch (e) {
    console.error("❌ Erreur détaillée GetAll:", e); // Vérifie ta console node ici
    res.status(500).json({
      message: "Erreur lors de la récupération",
      error: e.message, // Aide au debug temporaire
    });
  }
};
exports.getById = async (req, res) => {
  try {
    const data = await TypeDocument.findByPk(req.params.id, {
      include: [
        "entitee_un",
        "entitee_deux",
        "entitee_trois",
        "metaFields",
        "pieces",
      ],
    });

    if (!data) return res.status(404).json({ message: "Document introuvable" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { nom, code, entites_un_id, entites_deux_id, entites_trois_id } =
      req.body;

    const doc = await TypeDocument.findByPk(id);
    if (!doc) {
      await t.rollback();
      return res.status(404).json({ message: "Document introuvable" });
    }

    // 1. Mise à jour des champs basiques
    await doc.update(
      {
        nom: nom || doc.nom,
        code: code || doc.code,
      },
      { transaction: t },
    );

    try {
      // 2. Mise à jour des relations (Many-to-Many)
      // .set... remplace les anciennes relations par les nouvelles dans la table pivot
      if (entites_un_id !== undefined) {
        await doc.setEntites_un(entites_un_id, { transaction: t });
      }
      if (entites_deux_id !== undefined) {
        await doc.setEntites_deux(entites_deux_id, { transaction: t });
      }
      if (entites_trois_id !== undefined) {
        await doc.setEntites_trois(entites_trois_id, { transaction: t });
      }
    } catch (e) {
      console.log("NOM DE L'ERREUR:", e.name);
    }

    await t.commit();

    // On recharge le document avec ses nouvelles relations pour le renvoyer au front
    const updatedDoc = await TypeDocument.findByPk(id, {
      include: ["entites_un", "entites_deux", "entites_trois"],
    });

    res.json({
      success: true,
      message: "Mise à jour réussie",
      data: updatedDoc,
    });
  } catch (e) {
    await t.rollback();
    console.error("Erreur Update TypeDoc:", e);
    res
      .status(500)
      .json({ message: "Erreur lors de la modification : " + e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await TypeDocument.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.addPiecesToTypeDocument = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { pieces } = req.body;

    const typeDocument = await TypeDocument.findByPk(id);
    if (!typeDocument)
      return res.status(404).json({ message: "Type de document introuvable" });

    for (const p of pieces) {
      await typeDocument.addPiece(p.piece, {
        through: {
          disponible: p.disponible ?? false,
          //fichier: null,
        },
        transaction: t,
      });
    }

    await t.commit();
    res.json({ message: "Pièces ajoutées avec succès" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
