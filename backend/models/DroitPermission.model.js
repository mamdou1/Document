module.exports = (sequelize, DataTypes) => {
  const DroitPermission = sequelize.define(
    "DroitPermission",
    {
      droit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "droit_permission",
      timestamps: true,
      underscored: true,
    }
  );

  return DroitPermission;
};
