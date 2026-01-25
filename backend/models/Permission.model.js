module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["resource", "action"],
        },
      ],
    }
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Droit, {
      through: "droit_permission",
      foreignKey: "permission_id",
      otherKey: "droit_id",
      timestamps: false,
    });
  };

  return Permission;
};
