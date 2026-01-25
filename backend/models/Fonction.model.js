// models/fonction.js
module.exports = (sequelize, DataTypes) => {
  const Fonction = sequelize.define(
    "Fonction",
    {
      libelle: { type: DataTypes.STRING, allowNull: false },
      service_id: { type: DataTypes.INTEGER, allowNull: true },
      division_id: { type: DataTypes.INTEGER, allowNull: true },
      section_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: "Fonctions", underscored: true }
  );

  Fonction.associate = (models) => {
    Fonction.belongsTo(models.Service, { foreignKey: "service_id" });
    Fonction.belongsTo(models.Division, { foreignKey: "division_id" });
    Fonction.belongsTo(models.Section, { foreignKey: "section_id" });
    Fonction.hasMany(models.Agent, { foreignKey: "fonction_id", as: "agents" });
  };
  return Fonction;
};
