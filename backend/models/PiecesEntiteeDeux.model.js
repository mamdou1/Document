// models/TypeDocumentEntiteUn.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "PicesEntiteDeux",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { tableName: "p_entitee_deux", underscored: true },
  );
};
