module.exports = (sequelize, DataTypes) => {
  const HistoriqueLog = sequelize.define(
    "HistoriqueLog",
    {
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      action: {
        type: DataTypes.STRING, // create, read, update, delete, login, upload...
        allowNull: false,
      },

      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ip: {
        type: DataTypes.STRING,
      },

      user_agent: {
        type: DataTypes.TEXT,
      },

      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "HistoriqueLog",
      timestamps: true,
      underscored: true,
    },
  );

  HistoriqueLog.associate = (models) => {
    HistoriqueLog.belongsTo(models.Agent, {
      foreignKey: "agent_id",
      as: "agent",
    });
  };

  return HistoriqueLog;
};
