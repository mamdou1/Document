// models/Permission.model.js
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
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
      tableName: "permissions", // Nom de la table en minuscules
      underscored: true, // Cette option convertit automatiquement camelCase en snake_case
      timestamps: true, // Active les timestamps
      createdAt: "created_at", // Spécifie le nom de la colonne created_at
      updatedAt: "updated_at", // Spécifie le nom de la colonne updated_at
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