// models/division.js
module.exports = (sequelize, DataTypes) => {
  const Division = sequelize.define(
    "Division",
    {
      libelle: { type: DataTypes.STRING, allowNull: false },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "Divisions", underscored: true },
  );

  Division.associate = (models) => {
    Division.belongsTo(models.Service, {
      foreignKey: "service_id",
      as: "service",
    });
    Division.hasMany(models.Section, {
      foreignKey: "division_id",
      as: "sections",
    });
    Division.hasMany(models.Fonction, {
      foreignKey: "division_id",
      as: "fonctions",
    });
    // Division.belongsTo(models.Type, {
    //   foreignKey: "piece_id",
    //   as: "types",
    // });
  };
  return Division;
};
