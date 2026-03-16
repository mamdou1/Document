// controllers/statistiques.controller.js
const { sequelize } = require("../models");
const { Agent, Document, TypeDocument } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

// =============================================
// 1. TOTAUX GLOBAUX
// =============================================

// ➤ Total des agents
exports.getTotalAgents = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération du total des agents", {
      userId: req.user?.id,
    });

    const total = await Agent.count();

    logger.info("✅ Total des agents récupéré", {
      total,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({ total });
  } catch (error) {
    logger.error("❌ Erreur getTotalAgents:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Total des types de documents
exports.getTotalTypesDocument = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération du total des types de documents", {
      userId: req.user?.id,
    });

    const total = await TypeDocument.count();

    logger.info("✅ Total des types de documents récupéré", {
      total,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({ total });
  } catch (error) {
    logger.error("❌ Erreur getTotalTypesDocument:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Total des documents
exports.getTotalDocuments = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération du total des documents", {
      userId: req.user?.id,
    });

    const total = await Document.count();

    logger.info("✅ Total des documents récupéré", {
      total,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({ total });
  } catch (error) {
    logger.error("❌ Erreur getTotalDocuments:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// =============================================
// 2. AGENTS PAR STRUCTURE
// =============================================

// ➤ Agents par EntiteeUn (Niveau 1)
exports.getAgentsByEntiteeUn = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des agents par entité niveau 1", {
      userId: req.user?.id,
    });

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

    logger.info("✅ Agents par entité niveau 1 récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getAgentsByEntiteeUn:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// ➤ Agents par EntiteeDeux (Niveau 2)
exports.getAgentsByEntiteeDeux = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des agents par entité niveau 2", {
      userId: req.user?.id,
    });

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

    logger.info("✅ Agents par entité niveau 2 récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getAgentsByEntiteeDeux:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Agents par EntiteeTrois (Niveau 3)
exports.getAgentsByEntiteeTrois = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des agents par entité niveau 3", {
      userId: req.user?.id,
    });

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

    logger.info("✅ Agents par entité niveau 3 récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getAgentsByEntiteeTrois:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Agents par structure (tous niveaux confondus)
exports.getAgentsByStructure = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des agents par structure", {
      userId: req.user?.id,
    });

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

    logger.info("✅ Agents par structure récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getAgentsByStructure:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// =============================================
// 3. STATISTIQUES DOCUMENTS
// =============================================

// ➤ Documents par type
exports.getDocumentsByType = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des documents par type", {
      userId: req.user?.id,
    });

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

    logger.info("✅ Documents par type récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getDocumentsByType:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➤ Documents créés par mois (derniers 12 mois)
exports.getDocumentsByMonth = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des documents par mois", {
      userId: req.user?.id,
    });

    // SOLUTION 1: Ajouter la colonne dans le GROUP BY
    const result = await sequelize.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as mois,
        DATE_FORMAT(created_at, '%b %Y') as moisLibelle,
        COUNT(*) as nombre
      FROM documents
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
      ORDER BY mois ASC
      `,
      { type: sequelize.QueryTypes.SELECT },
    );

    logger.info("✅ Documents par mois récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getDocumentsByMonth:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    
    // Retourner un tableau vide pour ne pas casser le frontend
    res.status(200).json([]);
  }
};

// ➤ Documents par structure (entité)
exports.getDocumentsByStructure = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des documents par structure", {
      userId: req.user?.id,
    });

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

    logger.info("✅ Documents par structure récupérés", {
      count: result.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(result);
  } catch (error) {
    logger.error("❌ Erreur getDocumentsByStructure:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: "Erreur serveur" });
  }
};
