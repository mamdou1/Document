// const { Agent, Permission } = require("../models");

// exports.getAgentPermissions = async (req, res) => {
//   try {
//     const agent = await Agent.findByPk(req.params.id, {
//       include: {
//         model: Permission,
//         through: { attributes: [] },
//       },
//     });

//     if (!agent) return res.status(404).json({ message: "Agent introuvable" });

//     res.json(agent.Permissions);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

// exports.updateAgentPermissions = async (req, res) => {
//   try {
//     const { permissions } = req.body; // ✅ CORRIGÉ

//     if (!Array.isArray(permissions)) {
//       return res
//         .status(400)
//         .json({ message: "permissions doit être un tableau" });
//     }

//     const agent = await Agent.findByPk(req.params.id);
//     if (!agent) return res.status(404).json({ message: "Agent introuvable" });

//     await agent.setPermissions(permissions); // ✅ OK

//     res.json({ message: "Permissions mises à jour" });
//   } catch (error) {
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };
