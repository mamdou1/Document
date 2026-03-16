// models/agentEntiteeAccess.js
module.exports = (sequelize, DataTypes) => {
  const AgentEntiteeAccess = sequelize.define(
    "AgentEntiteeAccess",
    {
      // On supprime entitee_type et entitee_id
      // On garde juste les foreign keys directes
    },
    {
      tableName: "agent_entitee_access",
      timestamps: true,
      underscored: true,
    },
  );

  AgentEntiteeAccess.associate = (models) => {
    AgentEntiteeAccess.belongsTo(models.Agent, {
      foreignKey: "agent_id",
      as: "agent",
    });

    // Associations directes avec les entités
    AgentEntiteeAccess.belongsTo(models.EntiteeUn, {
      foreignKey: "entitee_un_id",
      as: "entitee_un",
      allowNull: true,
    });

    AgentEntiteeAccess.belongsTo(models.EntiteeDeux, {
      foreignKey: "entitee_deux_id",
      as: "entitee_deux",
      allowNull: true,
    });

    AgentEntiteeAccess.belongsTo(models.EntiteeTrois, {
      foreignKey: "entitee_trois_id",
      as: "entitee_trois",
      allowNull: true,
    });
  };

  return AgentEntiteeAccess;
};
