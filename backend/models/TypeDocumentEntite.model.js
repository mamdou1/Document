// models/TypeDocumentEntiteUn.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "TypeDocumentEntiteUn",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { tableName: "td_entitee_un", underscored: true },
  );
};
