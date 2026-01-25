// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const fournisseurShema = new Schema(
//   {
//     NIF: { type: String, require: true },
//     raisonSocial: { type: String, require: true },
//     sigle: { type: String, require: true },
//     adresse: { type: String, require: true },
//     numero: { type: String, require: true },
//   },

//   { timestamps: true }
// );

// module.exports = mongoose.model("Fournisseur", fournisseurShema);

module.exports = (sequelize, DataTypes) => {
  const Fournisseur = sequelize.define(
    "Fournisseur",
    {
      NIF: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      raisonSocial: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secteurActivite: {
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
      numero: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "Fournisseur",
      timestamps: true,
      underscored: true,
    }
  );

  return Fournisseur;
};
