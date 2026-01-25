module.exports = (sequelize, DataTypes) => {
  const Programme = sequelize.define(
    "Programme",
    {
      code_programme: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
    },
    {
      tableName: "programme",
      timestamps: true,
      underscored: true,
    }
  );

  Programme.associate = (models) => {
    Programme.belongsTo(models.Exercice, {
      foreignKey: "exercice_id",
      as: "exercice",
    });

    Programme.hasMany(models.Chapitre, {
      foreignKey: "programme_id",
    });
  };

  return Programme;
};
