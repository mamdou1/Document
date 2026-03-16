module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "TypeDocumentEntiteDeux",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { tableName: "td_entitee_deux", underscored: true },
  );
};
