module.exports = (sequelize, DataTypes) => {
  const DocumentTypePiece = sequelize.define(
    "TypeDocumentPieces",
    {
      document_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      piece_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "document_type_pieces",
      timestamps: false,
      underscored: true,
    },
  );

  return DocumentTypePiece;
};
