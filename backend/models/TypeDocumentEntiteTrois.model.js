module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "TypeDocumentEntiteTrois",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { tableName: "td_entitee_trois", underscored: true },
  );
};
