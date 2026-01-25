// models/service.js
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    "Service",
    {
      libelle: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "Services", underscored: true }
  );

  Service.associate = (models) => {
    Service.hasMany(models.Division, {
      foreignKey: "service_id",
      as: "divisions",
    });
    Service.hasMany(models.Fonction, {
      foreignKey: "service_id",
      as: "fonctions",
    });
  };
  return Service;
};
