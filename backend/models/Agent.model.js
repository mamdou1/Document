module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define(
    "Agent",
    {
      nom: DataTypes.STRING,
      prenom: DataTypes.STRING,
      num_matricule: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
      telephone: {
        type: DataTypes.STRING,
        unique: true,
      },

      droit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // genre: DataTypes.ENUM("HOMME", "FEMME"),
      role: DataTypes.ENUM("ADMIN", "MEMBRE_AUTHORIZE", "MEMBRE"),
      code_verification: DataTypes.STRING,
      reset_code_expiry: DataTypes.DATE,
      is_verified_for_reset: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      photo_profil: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      fonction_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Ou false selon votre besoin de rigueur
      },
    },
    {
      tableName: "Agent",
      timestamps: true,
      underscored: true,
    }
  );

  Agent.associate = (models) => {
    Agent.belongsTo(models.Agent, {
      as: "createur",
      foreignKey: "enregistrer_par",
    });

    Agent.belongsTo(models.Fonction, {
      as: "fonction_details",
      foreignKey: "fonction_id",
    });

    Agent.belongsTo(models.Droit, {
      as: "droit",
      foreignKey: "droit_id",
    });

    // Agent.belongsToMany(models.Permission, {
    //   through: "agent_permissions",
    //   foreignKey: "agent_id",
    //   otherKey: "permission_id",
    // });
  };

  return Agent;
};
