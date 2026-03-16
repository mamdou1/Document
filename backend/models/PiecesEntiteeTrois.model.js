// models/TypeDocumentEntiteUn.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "PicesEntiteTrois",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { tableName: "p_entitee_trois", underscored: true },
  );
};
