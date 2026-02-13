module.exports = (sequelize, DataTypes) => {
  const DocumentFichier = sequelize.define(
    "pieces_fichiers",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      document_id: { type: DataTypes.INTEGER, allowNull: false },
      piece_id: { type: DataTypes.INTEGER, allowNull: true },
      fichier: { type: DataTypes.STRING, allowNull: false },
      original_name: { type: DataTypes.STRING },
      mode: {
        type: DataTypes.ENUM("INDIVIDUEL", "LOT_UNIQUE"),
        allowNull: false,
        defaultValue: "INDIVIDUEL",
      },
    },
    {
      tableName: "document_fichiers",
      timestamps: true,
      underscored: true,
    },
  );

  DocumentFichier.associate = (models) => {
    DocumentFichier.belongsTo(models.Pieces, {
      foreignKey: "piece_id",
      as: "piece",
    });

    DocumentFichier.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });
  };

  return DocumentFichier;
};
