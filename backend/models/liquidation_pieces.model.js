module.exports = (sequelize, DataTypes) => {
  const LiquidationPieces = sequelize.define(
    "LiquidationPieces",
    {
      liquidation_id: {
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
      tableName: "liquidation_pieces",
      timestamps: true,
      underscored: true,
    },
  );

  return LiquidationPieces;
};
