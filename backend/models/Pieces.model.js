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

    Pieces.belongsToMany(models.TypeDocument, {
      through: models.TypeDocumentPieces,
      foreignKey: "piece_id",
      otherKey: "document_type_id",
      as: "typesDocument",
    });

    Pieces.belongsToMany(models.Document, {
      through: models.DocumentPieces,
      foreignKey: "piece_id",
      otherKey: "document_id",
      as: "document",
    });
    Pieces.hasMany(models.DocumentFichier, {
      foreignKey: "piece_id",
      as: "documentFichiers",
    });
    //   Pieces.belongsTo(models.EntiteeUn, {
    //     foreignKey: "entitee_un_id",
    //     as: "entitee_un",
    //   });
    //   Pieces.belongsTo(models.EntiteeDeux, {
    //     foreignKey: "entitee_deux_id",
    //     as: "entitee_deux",
    //   });
    //   Pieces.belongsTo(models.EntiteeTrois, {
    //     foreignKey: "entitee_trois_id",
    //     as: "entitee_trois",
    //   });

    // Remplace les belongsTo individuels par belongsToMany
    // Relation avec Niveau 1 (Plusieurs à Plusieurs)
    Pieces.belongsToMany(models.EntiteeUn, {
      through: models.TypeDocumentEntiteUn,
      foreignKey: "type_document_id",
      otherKey: "entitee_un_id",
      as: "entites_un",
    });

    // Relation avec Niveau 2 (Plusieurs à Plusieurs)
    Pieces.belongsToMany(models.EntiteeDeux, {
      through: models.TypeDocumentEntiteDeux,
      foreignKey: "type_document_id",
      otherKey: "entitee_deux_id",
      as: "entites_deux",
    });

    // Relation avec Niveau 3 (Plusieurs à Plusieurs)
    Pieces.belongsToMany(models.EntiteeTrois, {
      through: models.TypeDocumentEntiteTrois,
      foreignKey: "type_document_id",
      otherKey: "entitee_trois_id",
      as: "entites_trois",
    });
  };

  return Pieces;
};
