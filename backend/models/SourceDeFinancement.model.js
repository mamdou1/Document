module.exports = (sequelize, DataTypes) => {
  const SourceDeFinancement = sequelize.define(
    "SourceDeFinancement",
    {
      libelle: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "SourceDeFinancement", timestamps: true, underscored: true },
  );

  return SourceDeFinancement;
};
