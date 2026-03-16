module.exports = (sequelize, DataTypes) => {
  const Rayon = sequelize.define(
    "Rayon",
    {
      code: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "rayons", underscored: true },
  );

  Rayon.associate = (models) => {
    Rayon.belongsTo(models.Salle, { foreignKey: "salle_id", as: "salle" });
    Rayon.hasMany(models.Trave, { foreignKey: "rayon_id", as: "traves" });
  };
  return Rayon;
};
