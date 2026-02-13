// controllers/agentEntiteeAccess.controller.js
const {
  AgentEntiteeAccess,
  Agent,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} = require("../models");

/**
 * Crée un ou plusieurs accès pour un agent
 * Accepte un objet ou un tableau d'objets
 */
exports.grant = async (req, res) => {
  try {
    const payloads = req.body;

    // Vérifier que c'est un tableau
    if (!Array.isArray(payloads)) {
      return res
        .status(400)
        .json({ message: "Le payload doit être un tableau" });
    }

    // Valider chaque payload
    for (const p of payloads) {
      if (!p.agent_id) {
        return res.status(400).json({
          message: "agent_id est requis pour chaque accès",
        });
      }

      if (!p.entitee_un_id && !p.entitee_deux_id && !p.entitee_trois_id) {
        return res.status(400).json({
          message:
            "Au moins une entité (UN, DEUX, TROIS) est requise par accès",
        });
      }
    }

    // Insertion en masse
    const results = await AgentEntiteeAccess.bulkCreate(
      payloads.map((p) => ({
        agent_id: p.agent_id,
        entitee_un_id: p.entitee_un_id || null,
        entitee_deux_id: p.entitee_deux_id || null,
        entitee_trois_id: p.entitee_trois_id || null,
      })),
      {
        returning: true,
        validate: true,
      },
    );

    // Recharger avec les associations pour avoir les libellés
    const created = await AgentEntiteeAccess.findAll({
      where: { id: results.map((r) => r.id) },
      include: [
        { model: EntiteeUn, as: "entitee_un" },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
        },
      ],
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Erreur grant access:", err);
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message,
    });
  }
};

// Récupérer les accès d'un agent
exports.agentAccesById = async (req, res) => {
  try {
    const { agentId } = req.params;

    const rows = await AgentEntiteeAccess.findAll({
      where: { agent_id: agentId },
      include: [
        { model: EntiteeUn, as: "entitee_un", required: false },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
          required: false,
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
          required: false,
        },
      ],
    });

    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération accès:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Révoquer un accès
exports.revoke = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 LOG 2 : Vérifier si l'ID est valide
    if (!id) {
      console.error("❌ REVOKE - ID manquant !");
      return res.status(400).json({ message: "ID requis" });
    }

    // 🔍 LOG 3 : Rechercher l'enregistrement avant suppression
    const access = await AgentEntiteeAccess.findByPk(id);

    if (!access) {
      console.error(`❌ REVOKE - Accès ID ${id} non trouvé dans la base`);
      console.log(
        "🔍 Vérifiez que l'ID existe dans la table agent_entitee_access",
      );
      return res.status(404).json({
        success: false,
        message: "Accès non trouvé",
        id: id,
      });
    }

    console.log("✅ REVOKE - Accès trouvé:", {
      id: access.id,
      agent_id: access.agent_id,
      entitee_un_id: access.entitee_un_id,
      entitee_deux_id: access.entitee_deux_id,
      entitee_trois_id: access.entitee_trois_id,
      created_at: access.created_at,
    });

    // 🔍 LOG 4 : Tentative de suppression
    console.log(`🗑️ REVOKE - Suppression de l'accès ID ${id}...`);
    const deleted = await AgentEntiteeAccess.destroy({
      where: { id },
    });

    // 🔍 LOG 5 : Vérifier le résultat de la suppression
    console.log(`📊 REVOKE - Résultat destroy:`, deleted);
    console.log(`📊 REVOKE - ${deleted} ligne(s) supprimée(s)`);

    if (deleted === 0) {
      console.warn(`⚠️ REVOKE - Aucune ligne supprimée pour ID ${id}`);
      return res.status(404).json({
        success: false,
        message: "Aucun accès supprimé",
        id: id,
      });
    }

    // ✅ LOG 6 : Succès
    console.log(`✅ REVOKE - Accès ID ${id} révoqué avec succès !`);
    console.log("=".repeat(50));

    res.json({
      success: true,
      message: "Accès révoqué avec succès",
      deleted: deleted,
      id: id,
    });
  } catch (err) {
    console.error("=".repeat(50));

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la révocation",
      error: err.message,
    });
  }
};

// Mettre à jour un accès
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id, entitee_un_id, entitee_deux_id, entitee_trois_id } =
      req.body;

    const row = await AgentEntiteeAccess.findByPk(id);
    if (!row) {
      return res.status(404).json({ message: "Accès introuvable" });
    }

    // Mise à jour
    if (agent_id !== undefined) row.agent_id = agent_id;
    if (entitee_un_id !== undefined) row.entitee_un_id = entitee_un_id;
    if (entitee_deux_id !== undefined) row.entitee_deux_id = entitee_deux_id;
    if (entitee_trois_id !== undefined) row.entitee_trois_id = entitee_trois_id;

    // Validation: au moins une entité
    if (!row.entitee_un_id && !row.entitee_deux_id && !row.entitee_trois_id) {
      return res.status(400).json({
        message: "Au moins une entité doit être spécifiée",
      });
    }

    await row.save();

    // Recharger avec les associations
    const updated = await AgentEntiteeAccess.findByPk(id, {
      include: [
        { model: EntiteeUn, as: "entitee_un" },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
        },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Erreur update:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// Lister tous les accès
exports.list = async (req, res) => {
  try {
    const data = await AgentEntiteeAccess.findAll({
      include: [
        { model: Agent, as: "agent" },
        { model: EntiteeUn, as: "entitee_un" },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          include: [{ model: EntiteeUn, as: "entitee_un" }],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          include: [
            {
              model: EntiteeDeux,
              as: "entitee_deux",
              include: [{ model: EntiteeUn, as: "entitee_un" }],
            },
          ],
        },
      ],
    });
    res.json(data);
  } catch (err) {
    console.error("Erreur list:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
