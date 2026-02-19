module.exports = (sequelize, DataTypes) => {
  const PiecesFile = sequelize.define(
    "PiecesFile",
    {
      filename: DataTypes.STRING,
      path: DataTypes.STRING,
      size: DataTypes.INTEGER,
      mimetype: DataTypes.STRING,
      document_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "pieces_files", timestamps: true, underscored: true },
  );

  PiecesFile.associate = (models) => {
    PiecesFile.belongsTo(models.PieceValue, {
      foreignKey: "pieces_value_id",
    });

    PiecesFile.belongsTo(models.Pieces, {
      foreignKey: "Pieces_id",
    });
  };

  return PiecesFile;
};
