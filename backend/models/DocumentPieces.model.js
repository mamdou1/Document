module.exports = (sequelize, DataTypes) => {
  const DocumentPieces = sequelize.define(
    "DocumentPieces",
    {
      document_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      piece_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "document_pieces",
      timestamps: true,
      underscored: true,
    },
  );

  return DocumentPieces;
};
