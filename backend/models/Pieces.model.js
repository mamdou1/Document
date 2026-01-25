module.exports = (sequelize, DataTypes) => {
  const Pieces = sequelize.define(
    "Pieces",
    {
      code_pieces: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      division_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "pieces",
      timestamps: true,
      underscored: true,
    },
  );
  Pieces.associate = (models) => {
    Pieces.belongsToMany(models.Type, {
      through: models.TypePieces,
      foreignKey: "piece_id",
      otherKey: "type_id",
      as: "types",
    });

    Pieces.belongsToMany(models.Liquidation, {
      through: models.LiquidationPieces,
      foreignKey: "piece_id",
      otherKey: "liquidation_id",
      as: "liquidations",
    });

    Pieces.hasMany(models.PiecesFichier, {
      foreignKey: "piece_id",
      as: "fichiers",
    });
    Pieces.belongsTo(models.Division, {
      foreignKey: "division_id",
      as: "division",
    });
  };

  return Pieces;
};
