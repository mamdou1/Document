module.exports = (sequelize, DataTypes) => {
  const PiecesFichier = sequelize.define(
    "pieces_fichiers",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      document_id: { type: DataTypes.INTEGER, allowNull: false },
      piece_id: { type: DataTypes.INTEGER, allowNull: true },
      piece_value_id: { type: DataTypes.INTEGER, allowNull: true },
      fichier: { type: DataTypes.STRING, allowNull: false },
      original_name: { type: DataTypes.STRING },
      new_file_name: { type: DataTypes.STRING },
      mode: {
        type: DataTypes.ENUM("INDIVIDUEL", "LOT_UNIQUE"),
        allowNull: false,
        defaultValue: "INDIVIDUEL",
      },
    },
    {
      tableName: "pieces_fichiers",
      timestamps: true,
      underscored: true,
    },
  );

  PiecesFichier.associate = (models) => {
    PiecesFichier.belongsTo(models.Pieces, {
      foreignKey: "piece_id",
      as: "piece",
    });

    PiecesFichier.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });

    PiecesFichier.belongsTo(models.PieceValue, {
      foreignKey: "piece_value_id",
      as: "pieceValue",
    });
  };

  return PiecesFichier;
};
