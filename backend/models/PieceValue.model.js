// models/PieceValue.js
module.exports = (sequelize, DataTypes) => {
  const PieceValue = sequelize.define(
    "PieceValue",
    {
      document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      piece_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      piece_meta_field_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      row_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "piece_values",
      timestamps: true,
      underscored: true,
    },
  );

  PieceValue.associate = (models) => {
    PieceValue.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });

    PieceValue.belongsTo(models.Pieces, {
      foreignKey: "piece_id",
      as: "piece",
    });

    // ✅ CORRECTION ICI : la clé étrangère est piece_meta_field_id, pas meta_field_id
    PieceValue.belongsTo(models.PieceMetaField, {
      // C'est PieceMetaField, pas MetaField !
      foreignKey: "piece_meta_field_id", // ✅ C'est piece_meta_field_id
      as: "piece_metaField", // L'alias utilisé dans le contrôleur est "metaField"
    });

    PieceValue.hasOne(models.PiecesFichier, {
      foreignKey: "piece_value_id",
      as: "file",
    });
  };

  return PieceValue;
};
