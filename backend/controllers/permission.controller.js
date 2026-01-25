const { Permission } = require("../models");

exports.getAllPermissions = async (req, res) => {
  const permissions = await Permission.findAll({
    order: [
      ["resource", "ASC"],
      ["action", "ASC"],
    ],
  });
  res.json(permissions);
};
