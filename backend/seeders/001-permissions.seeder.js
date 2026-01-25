const { Permission } = require("../models");

module.exports = async () => {
  const permissions = [
    { resource: "programme", action: "create" },
    { resource: "programme", action: "read" },
    { resource: "programme", action: "update" },
    { resource: "programme", action: "delete" },

    { resource: "chapitre", action: "create" },
    { resource: "chapitre", action: "read" },
    { resource: "chapitre", action: "update" },
    { resource: "chapitre", action: "delete" },

    { resource: "liquidation", action: "create" },
    { resource: "liquidation", action: "read" },
    { resource: "liquidation", action: "update" },
    { resource: "liquidation", action: "delete" },

    { resource: "nature", action: "create" },
    { resource: "nature", action: "read" },
    { resource: "nature", action: "update" },
    { resource: "nature", action: "delete" },

    { resource: "exercice", action: "create" },
    { resource: "exercice", action: "read" },
    { resource: "exercice", action: "update" },
    { resource: "exercice", action: "delete" },

    { resource: "fournisseur", action: "create" },
    { resource: "fournisseur", action: "read" },
    { resource: "fournisseur", action: "update" },
    { resource: "fournisseur", action: "delete" },

    { resource: "serviceBeneficiaire", action: "create" },
    { resource: "serviceBeneficiaire", action: "read" },
    { resource: "serviceBeneficiaire", action: "update" },
    { resource: "serviceBeneficiaire", action: "delete" },

    { resource: "agent", action: "create" },
    { resource: "agent", action: "read" },
    { resource: "agent", action: "update" },
    { resource: "agent", action: "delete" },

    { resource: "pieces", action: "create" },
    { resource: "pieces", action: "read" },
    { resource: "pieces", action: "update" },
    { resource: "pieces", action: "delete" },

    { resource: "statistique", action: "create" },
    { resource: "statistique", action: "read" },
    { resource: "statistique", action: "update" },

    { resource: "type", action: "create" },
    { resource: "type", action: "read" },
    { resource: "type", action: "update" },
    { resource: "type", action: "delete" },

    { resource: "droit", action: "create" },
    { resource: "droit", action: "read" },
    { resource: "droit", action: "update" },
    { resource: "droit", action: "delete" },

    { resource: "service", action: "read" },
    { resource: "service", action: "create" },
    { resource: "service", action: "update" },
    { resource: "service", action: "delete" },

    { resource: "division", action: "read" },
    { resource: "division", action: "create" },
    { resource: "division", action: "update" },
    { resource: "division", action: "delete" },

    { resource: "section", action: "read" },
    { resource: "section", action: "create" },
    { resource: "section", action: "update" },
    { resource: "section", action: "delete" },

    { resource: "fonction", action: "read" },
    { resource: "fonction", action: "create" },
    { resource: "fonction", action: "update" },
    { resource: "fonction", action: "delete" },

    { resource: "sourceDeFinancement", action: "read" },
    { resource: "sourceDeFinancement", action: "create" },
    { resource: "sourceDeFinancement", action: "update" },
    { resource: "sourceDeFinancement", action: "delete" },

    { resource: "historique", action: "read" },
  ];

  console.log("⏳ Seeding permissions...");

  for (const perm of permissions) {
    await Permission.findOrCreate({
      where: {
        resource: perm.resource,
        action: perm.action,
      },
    });
  }

  const count = await Permission.count();
  console.log("✅ Permissions en base :", count);

  console.log("✅ Permissions seedées");
};
