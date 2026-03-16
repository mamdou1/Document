module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define(
    "Site",
    {
      nom: { type: DataTypes.STRING, allowNull: false },
      adresse: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "sites",
      timestamps: true,
      underscored: true,
    },
  );

  Site.associate = (models) => {
    // AJOUT : Un site a plusieurs salles
    Site.hasMany(models.Salle, { foreignKey: "site_id", as: "salles" });
  };

  return Site;
};
