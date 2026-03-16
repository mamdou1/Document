module.exports = (sequelize, DataTypes) => {
  const Salle = sequelize.define(
    "Salle",
    {
      code_salle: { type: DataTypes.STRING, allowNull: false },
      libelle: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "salle", underscored: true },
  );

  Salle.associate = (models) => {
    Salle.belongsTo(models.Site, { foreignKey: "site_id", as: "site" });
    Salle.hasMany(models.Rayon, { foreignKey: "salle_id", as: "rayons" });
  };
  return Salle;
};
