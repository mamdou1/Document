module.exports = (sequelize, DataTypes) => {
  const Nature = sequelize.define(
    "Nature",
    {
      code_nature: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
    },
    {
      tableName: "nature",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["chapitre_id", "code_nature"],
        },
      ],
    }
  );

  Nature.associate = (models) => {
    Nature.belongsTo(models.Chapitre, {
      foreignKey: "chapitre_id",
      as: "chapitre",
    });
  };

  return Nature;
};
