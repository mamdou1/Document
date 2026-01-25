// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const serviceBeneficiaireSchema = new Schema(
//   {
//     codeService: { type: String, required: true },
//     libelle: { type: String, required: true },
//     sigle: { type: String, required: true },
//     adresse: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model(
//   "ServiceBeneficiaire",
//   serviceBeneficiaireSchema
// );

module.exports = (sequelize, DataTypes) => {
  const ServiceBeneficiaire = sequelize.define(
    "ServiceBeneficiaire",
    {
      codeService: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sigle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      adresse: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "ServiceBeneficiaire",
      timestamps: true,
      underscored: true,
    }
  );

  return ServiceBeneficiaire;
};
