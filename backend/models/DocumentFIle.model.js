module.exports = (sequelize, DataTypes) => {
  const DocumentFile = sequelize.define(
    "DocumentFile",
    {
      filename: DataTypes.STRING,
      path: DataTypes.STRING,
      size: DataTypes.INTEGER,
      mimetype: DataTypes.STRING,
      document_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "document_files", timestamps: true, underscored: true },
  );

  DocumentFile.associate = (models) => {
    DocumentFile.belongsTo(models.DocumentValue, {
      foreignKey: "document_value_id",
    });

    DocumentFile.belongsTo(models.Document, {
      foreignKey: "document_id",
    });
  };

  return DocumentFile;
};
