// models/TypeDocumentEntiteUn.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "PicesEntiteUn",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { tableName: "p_entitee_un", underscored: true },
  );
};
