module.exports = (sequelize, DataTypes) => {
  const Etagere = sequelize.define(
    "Etagere",
    {
      code_etagere: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "etagere",
      timestamps: true,
      underscored: true,
    },
  );

  Etagere.associate = (models) => {
    // Une étagère appartient à une salle
    Etagere.belongsTo(models.Salle, { foreignKey: "salle_id", as: "salle" });
    // Une étagère contient plusieurs boxes
    Etagere.hasMany(models.Box, { foreignKey: "etagere_id", as: "boxes" });
  };

  return Etagere;
};
