module.exports = (sequelize, DataTypes) => {
  const Chapitre = sequelize.define(
    "Chapitre",
    {
      code_chapitre: {
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
      tableName: "chapitre",
      timestamps: true,
      underscored: true,
    }
  );

  Chapitre.associate = (models) => {
    Chapitre.belongsTo(models.Programme, {
      foreignKey: "programme_id",
      as: "programme",
    });

    Chapitre.hasMany(models.Nature, {
      foreignKey: "chapitre_id",
    });
  };

  return Chapitre;
};
