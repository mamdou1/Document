module.exports = (sequelize, DataTypes) => {
  const PiecesFichier = sequelize.define(
    "pieces_fichiers",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      liquidation_id: { type: DataTypes.INTEGER, allowNull: false },
      piece_id: { type: DataTypes.INTEGER, allowNull: false },
      fichier: { type: DataTypes.STRING, allowNull: false },
      original_name: { type: DataTypes.STRING },
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

    PiecesFichier.belongsTo(models.Liquidation, {
      foreignKey: "liquidation_id",
      as: "liquidation",
    });
  };

  return PiecesFichier;
};
