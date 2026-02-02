module.exports = (sequelize, DataTypes) => {
  const TypeDocument = sequelize.define(
    "TypeDocument",
    {
      code: DataTypes.STRING,
      nom: DataTypes.STRING,
    },
    {
      tableName: "typedocuments", // 👈 correspond exactement au nom réel de la table timestamps: false,
      timestamps: true,
      underscored: true,
    },
  );

  TypeDocument.associate = (models) => {
    TypeDocument.hasMany(models.MetaField, {
      foreignKey: "type_document_id",
      as: "metaFields",
    });
    TypeDocument.hasMany(models.Document, {
      foreignKey: "type_document_id",
      as: "documents",
    });

    TypeDocument.belongsToMany(models.Pieces, {
      through: models.TypeDocumentPieces,
      foreignKey: "document_type_id",
      otherKey: "piece_id",
      as: "pieces",
    });

    // Remplace les belongsTo individuels par belongsToMany
    // Relation avec Niveau 1 (Plusieurs à Plusieurs)
    TypeDocument.belongsToMany(models.EntiteeUn, {
      through: models.TypeDocumentEntiteUn,
      foreignKey: "type_document_id",
      otherKey: "entitee_un_id",
      as: "entites_un",
    });

    // Relation avec Niveau 2 (Plusieurs à Plusieurs)
    TypeDocument.belongsToMany(models.EntiteeDeux, {
      through: models.TypeDocumentEntiteDeux,
      foreignKey: "type_document_id",
      otherKey: "entitee_deux_id",
      as: "entites_deux",
    });

    // Relation avec Niveau 3 (Plusieurs à Plusieurs)
    TypeDocument.belongsToMany(models.EntiteeTrois, {
      through: models.TypeDocumentEntiteTrois,
      foreignKey: "type_document_id",
      otherKey: "entitee_trois_id",
      as: "entites_trois",
    });
  };

  return TypeDocument;
};
