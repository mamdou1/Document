const { sequelize, Op } = require("../models");
const {
  Agent,
  Document,
  TypeDocument,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Fonction,
  Droit,
} = require("../models");

// =============================================
// 1. TOTAUX GLOBAUX
// =============================================

// ➤ Total des agents
exports.getTotalAgents = async (req, res) => {
  try {
    const total = await Agent.count();
    res.json({ total });
  } catch (error) {
    console.error("❌ Erreur getTotalAgents:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Total des types de documents
exports.getTotalTypesDocument = async (req, res) => {
  try {
    const total = await TypeDocument.count();
    res.json({ total });
  } catch (error) {
    console.error("❌ Erreur getTotalTypesDocument:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Total des documents
exports.getTotalDocuments = async (req, res) => {
  try {
    const total = await Document.count();
    res.json({ total });
  } catch (error) {
    console.error("❌ Erreur getTotalDocuments:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// =============================================
// 2. AGENTS PAR STRUCTURE
// =============================================

// ➤ Agents par EntiteeUn (Niveau 1)
// exports.getAgentsByEntiteeUn = async (req, res) => {
//   try {
//     const result = await Agent.findAll({
//       attributes: [
//         [sequelize.col("fonction_details.entitee_un.id"), "entiteeId"],
//         [
//           sequelize.col("fonction_details.entitee_un.libelle"),
//           "entiteeLibelle",
//         ],
//         [sequelize.fn("COUNT", sequelize.col("Agent.id")), "nombre"],
//       ],
//       include: [
//         {
//           model: Fonction,
//           as: "fonction_details",
//           attributes: [],
//           include: [
//             {
//               model: EntiteeUn,
//               as: "entitee_un",
//               attributes: [],
//             },
//           ],
//         },
//       ],
//       where: {
//         "$fonction_details.entitee_un.id$": { [sequelize.Op.ne]: null },
//       },
//       group: ["fonction_details.entitee_un.id"],
//       order: [[sequelize.literal("nombre"), "DESC"]],
//       raw: true,
//     });

//     res.json(result);
//   } catch (error) {
//     console.error("❌ Erreur getAgentsByEntiteeUn:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

// // ➤ Agents par EntiteeDeux (Niveau 2)
// exports.getAgentsByEntiteeDeux = async (req, res) => {
//   try {
//     const result = await Agent.findAll({
//       attributes: [
//         [sequelize.col("fonction_details.entitee_deux.id"), "entiteeId"],
//         [
//           sequelize.col("fonction_details.entitee_deux.libelle"),
//           "entiteeLibelle",
//         ],
//         [sequelize.fn("COUNT", sequelize.col("Agent.id")), "nombre"],
//       ],
//       include: [
//         {
//           model: Fonction,
//           as: "fonction_details",
//           attributes: [],
//           include: [
//             {
//               model: EntiteeDeux,
//               as: "entitee_deux",
//               attributes: [],
//             },
//           ],
//         },
//       ],
//       where: {
//         "$fonction_details.entitee_deux.id$": { [sequelize.Op.ne]: null },
//       },
//       group: ["fonction_details.entitee_deux.id"],
//       order: [[sequelize.literal("nombre"), "DESC"]],
//       raw: true,
//     });

//     res.json(result);
//   } catch (error) {
//     console.error("❌ Erreur getAgentsByEntiteeDeux:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

// // ➤ Agents par EntiteeTrois (Niveau 3)
// exports.getAgentsByEntiteeTrois = async (req, res) => {
//   try {
//     const result = await Agent.findAll({
//       attributes: [
//         [sequelize.col("fonction_details.entitee_trois.id"), "entiteeId"],
//         [
//           sequelize.col("fonction_details.entitee_trois.libelle"),
//           "entiteeLibelle",
//         ],
//         [sequelize.fn("COUNT", sequelize.col("Agent.id")), "nombre"],
//       ],
//       include: [
//         {
//           model: Fonction,
//           as: "fonction_details",
//           attributes: [],
//           include: [
//             {
//               model: EntiteeTrois,
//               as: "entitee_trois",
//               attributes: [],
//             },
//           ],
//         },
//       ],
//       where: {
//         "$fonction_details.entitee_trois.id$": { [sequelize.Op.ne]: null },
//       },
//       group: ["fonction_details.entitee_trois.id"],
//       order: [[sequelize.literal("nombre"), "DESC"]],
//       raw: true,
//     });

//     res.json(result);
//   } catch (error) {
//     console.error("❌ Erreur getAgentsByEntiteeTrois:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

// // ➤ Agents par structure (tous niveaux confondus)
// exports.getAgentsByStructure = async (req, res) => {
//   try {
//     const result = await sequelize.query(
//       `
//       SELECT
//         COALESCE(e3.libelle, e2.libelle, e1.libelle, 'Non assigné') as structureLibelle,
//         COALESCE(e3.titre, e2.titre, e1.titre, 'Sans structure') as structureTitre,
//         COUNT(a.id) as nombre
//       FROM agents a
//       LEFT JOIN fonctions f ON f.id = a.fonction_id
//       LEFT JOIN entitee_trois e3 ON e3.id = f.entitee_trois_id
//       LEFT JOIN entitee_deux e2 ON e2.id = f.entitee_deux_id
//       LEFT JOIN entitee_un e1 ON e1.id = f.entitee_un_id
//       GROUP BY structureLibelle, structureTitre
//       ORDER BY nombre DESC
//     `,
//       { type: sequelize.QueryTypes.SELECT },
//     );

//     res.json(result);
//   } catch (error) {
//     console.error("❌ Erreur getAgentsByStructure:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

// ➤ Agents par EntiteeUn (Niveau 1)
exports.getAgentsByEntiteeUn = async (req, res) => {
  try {
    console.log("=".repeat(60));
    console.log("🔍 getAgentsByEntiteeUn - Début de la requête");

    // ✅ SOLUTION 1: Utiliser une requête SQL brute avec le bon nom de table
    const result = await sequelize.query(
      `
      SELECT 
        e.id as entiteeId,
        e.libelle as entiteeLibelle,
        COUNT(a.id) as nombre
      FROM agent a
      LEFT JOIN fonctions f ON f.id = a.fonction_id
      LEFT JOIN entitee_un e ON e.id = f.entitee_un_id
      WHERE f.entitee_un_id IS NOT NULL
      GROUP BY e.id, e.libelle
      ORDER BY nombre DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    console.log(`✅ Résultat: ${result.length} lignes`);
    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getAgentsByEntiteeUn:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// ➤ Agents par EntiteeDeux (Niveau 2)
exports.getAgentsByEntiteeDeux = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        e.id as entiteeId,
        e.libelle as entiteeLibelle,
        COUNT(a.id) as nombre
      FROM agent a
      LEFT JOIN fonctions f ON f.id = a.fonction_id
      LEFT JOIN entitee_deux e ON e.id = f.entitee_deux_id
      WHERE f.entitee_deux_id IS NOT NULL
      GROUP BY e.id, e.libelle
      ORDER BY nombre DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getAgentsByEntiteeDeux:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Agents par EntiteeTrois (Niveau 3)
exports.getAgentsByEntiteeTrois = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        e.id as entiteeId,
        e.libelle as entiteeLibelle,
        COUNT(a.id) as nombre
      FROM agent a
      LEFT JOIN fonctions f ON f.id = a.fonction_id
      LEFT JOIN entitee_trois e ON e.id = f.entitee_trois_id
      WHERE f.entitee_trois_id IS NOT NULL
      GROUP BY e.id, e.libelle
      ORDER BY nombre DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getAgentsByEntiteeTrois:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Agents par structure (tous niveaux confondus)
exports.getAgentsByStructure = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        COALESCE(e3.libelle, e2.libelle, e1.libelle, 'Non assigné') as structureLibelle,
        COALESCE(e3.titre, e2.titre, e1.titre, 'Sans structure') as structureTitre,
        COUNT(a.id) as nombre
      FROM agent a
      LEFT JOIN fonctions f ON f.id = a.fonction_id
      LEFT JOIN entitee_trois e3 ON e3.id = f.entitee_trois_id
      LEFT JOIN entitee_deux e2 ON e2.id = f.entitee_deux_id
      LEFT JOIN entitee_un e1 ON e1.id = f.entitee_un_id
      GROUP BY structureLibelle, structureTitre
      ORDER BY nombre DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getAgentsByStructure:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// =============================================
// 3. STATISTIQUES DOCUMENTS
// =============================================

// ➤ Documents par type
exports.getDocumentsByType = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        td.nom as typeNom,
        td.code as typeCode,
        COUNT(d.id) as nombre
      FROM documents d
      LEFT JOIN typedocuments td ON td.id = d.type_document_id
      GROUP BY td.id, td.nom, td.code
      ORDER BY nombre DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getDocumentsByType:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Documents créés par mois (derniers 12 mois)
exports.getDocumentsByMonth = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as mois,
        DATE_FORMAT(created_at, '%b %Y') as moisLibelle,
        COUNT(*) as nombre
      FROM documents
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY mois ASC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getDocumentsByMonth:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Documents par structure (entité)
exports.getDocumentsByStructure = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        COALESCE(td.entitee_trois_id, td.entitee_deux_id, td.entitee_un_id, 0) as entiteeId,
        COALESCE(e3.libelle, e2.libelle, e1.libelle, 'Non assigné') as structureLibelle,
        COALESCE(e3.titre, e2.titre, e1.titre, 'Sans structure') as structureTitre,
        COUNT(d.id) as nombre
      FROM documents d
      LEFT JOIN typedocuments td ON td.id = d.type_document_id
      LEFT JOIN entitee_trois e3 ON e3.id = td.entitee_trois_id
      LEFT JOIN entitee_deux e2 ON e2.id = td.entitee_deux_id
      LEFT JOIN entitee_un e1 ON e1.id = td.entitee_un_id
      GROUP BY entiteeId, structureLibelle, structureTitre
      ORDER BY nombre DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Erreur getDocumentsByStructure:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
