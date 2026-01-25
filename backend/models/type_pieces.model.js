module.exports = (sequelize, DataTypes) => {
  const TypePieces = sequelize.define(
    "type_pieces",
    {
      type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      piece_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      // disponible: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
    },
    {
      tableName: "type_pieces",
      timestamps: false,
      underscored: true,
    },
  );

  return TypePieces;
};
