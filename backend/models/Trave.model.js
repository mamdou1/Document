module.exports = (sequelize, DataTypes) => {
  const Trave = sequelize.define(
    "Trave",
    {
      code: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "traves", // Pluriel pour la cohérence
      timestamps: true,
      underscored: true,
    },
  );

  Trave.associate = (models) => {
    // Correction : rayon_id et non ayon_id
    Trave.belongsTo(models.Rayon, { foreignKey: "rayon_id", as: "rayon" });
    // Correction : C'est la travée qui a des boxes
    Trave.hasMany(models.Box, { foreignKey: "trave_id", as: "box" });
  };

  return Trave;
};
