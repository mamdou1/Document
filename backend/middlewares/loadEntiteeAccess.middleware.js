const { AgentEntiteeAccess } = require("../models");

module.exports = async (req, res, next) => {
  if (!req.user) return next();

  const access = await AgentEntiteeAccess.findAll({
    where: { agent_id: req.user.id },
  });

  req.entiteeAccess = access;
  next();
};
