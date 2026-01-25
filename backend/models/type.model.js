module.exports = (sequelize, DataTypes) => {
  const Type = sequelize.define(
    "Type",
    {
      codeType: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "code_type",
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "types",
      timestamps: true,
      underscored: true,
    },
  );

  Type.associate = (models) => {
    Type.belongsToMany(models.Pieces, {
      through: models.TypePieces,
      foreignKey: "type_id",
      otherKey: "piece_id",
      as: "pieces",
    });
  };

  return Type;
};
