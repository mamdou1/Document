// models/section.js
module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define(
    "Section",
    {
      libelle: { type: DataTypes.STRING, allowNull: false },
      division_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "Sections", underscored: true }
  );

  Section.associate = (models) => {
    Section.belongsTo(models.Division, {
      foreignKey: "division_id",
      as: "division",
    });
    Section.hasMany(models.Fonction, {
      foreignKey: "section_id",
      as: "fonctions",
    });
  };
  return Section;
};
