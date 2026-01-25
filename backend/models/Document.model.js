module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "Document",
    {},
    { tableName: "documents", timestamps: true, underscored: true },
  );

  Document.associate = (models) => {
    Document.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });
    Document.hasMany(models.DocumentValue, {
      foreignKey: "document_id",
      as: "values",
    });
  };

  return Document;
};
