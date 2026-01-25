module.exports = (sequelize, DataTypes) => {
  const Liquidation = sequelize.define(
    "Liquidation",
    {
      description: DataTypes.TEXT,
      source_de_financement_id: DataTypes.TEXT,
      num_dossier: DataTypes.STRING,
      montant: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      date_liquidation: DataTypes.DATE,
    },
    {
      tableName: "liquidation",
      timestamps: true,
      underscored: true,
    },
  );

  Liquidation.associate = (models) => {
    Liquidation.belongsTo(models.Programme, {
      foreignKey: "programme_id",
      as: "programme",
    });

    Liquidation.belongsTo(models.Chapitre, {
      foreignKey: "chapitre_id",
      as: "chapitre",
    });

    Liquidation.belongsTo(models.Nature, {
      foreignKey: "nature_id",
      as: "nature",
    });

    Liquidation.belongsTo(models.Type, {
      foreignKey: "type_id",
      as: "type",
    });

    Liquidation.belongsTo(models.Fournisseur, {
      foreignKey: "fournisseur_id",
      as: "fournisseur",
    });

    Liquidation.belongsTo(models.ServiceBeneficiaire, {
      foreignKey: "service_beneficiaire_id",
      as: "serviceBeneficiaire",
    });

    Liquidation.belongsTo(models.SourceDeFinancement, {
      foreignKey: "source_de_financement_id",
      as: "sourceDeFinancement",
    });

    Liquidation.belongsToMany(models.Pieces, {
      through: models.LiquidationPieces,
      foreignKey: "liquidation_id",
      otherKey: "piece_id",
      as: "pieces",
    });
  };

  return Liquidation;
};
