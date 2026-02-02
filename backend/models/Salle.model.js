module.exports = (sequelize, DataTypes) => {
  const Salle = sequelize.define(
    "Salle",
    {
      code_salle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "salle",
      timestamps: true,
      underscored: true,
    },
  );

  Salle.associate = (models) => {
    // Une salle contient plusieurs étagères
    Salle.hasMany(models.Etagere, { foreignKey: "salle_id", as: "etageres" });
  };

  return Salle;
};
