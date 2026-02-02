// Modèle Box
module.exports = (sequelize, DataTypes) => {
  const Box = sequelize.define(
    "Box",
    {
      code_box: { type: DataTypes.STRING, allowNull: false },
      libelle: { type: DataTypes.STRING, allowNull: false },
      capacite_max: { type: DataTypes.INTEGER, allowNull: false }, // Limite max
      current_count: { type: DataTypes.INTEGER, defaultValue: 0 }, // Compteur actuel
      type_document_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "box",
      underscored: true,
    },
  );

  Box.associate = (models) => {
    // Un box appartient à une étagère
    Box.belongsTo(models.Etagere, {
      foreignKey: "etagere_id",
      as: "etagere",
    });
    // Un box contient plusieurs documents
    Box.hasMany(models.Document, {
      foreignKey: "box_id",
      as: "documents",
    });
  };

  return Box;
};
