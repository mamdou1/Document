module.exports = (sequelize, DataTypes) => {
  const Exercice = sequelize.define(
    "Exercice",
    {
      annee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "exercice",
      timestamps: true,
      underscored: true,
    },
  );

  // Exercice.associate = (models) => {
  //   Exercice.hasMany(models.Programme, {
  //     foreignKey: "exercice_id",
  //   });
  // };

  return Exercice;
};
