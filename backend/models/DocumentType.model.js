module.exports = (sequelize, DataTypes) => {
  const TypeDocument = sequelize.define(
    "TypeDocument",
    {
      code: DataTypes.STRING,
      nom: DataTypes.STRING,
    },
    {
      tableName: "typedocuments", // 👈 correspond exactement au nom réel de la table timestamps: false,
      timestamps: true,
      underscored: true,
    },
  );

  TypeDocument.associate = (models) => {
    TypeDocument.belongsTo(models.Division, {
      foreignKey: "division_id",
      as: "division",
    });
    TypeDocument.hasMany(models.MetaField, {
      foreignKey: "type_document_id",
      as: "metaFields",
    });
    TypeDocument.hasMany(models.Document, {
      foreignKey: "type_document_id",
      as: "documents",
    });
  };

  return TypeDocument;
};
