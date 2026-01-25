const jwt = require("jsonwebtoken");

// Génère un access token (valable 60 minutes)
exports.generateAccessToken = (agent) => {
  return jwt.sign(
    { id: agent.id, role: agent.role }, // ⚠️ bien utiliser agent.id
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};

// Génère un refresh token (valable 7 jours)
exports.generateRefreshToken = (agent) => {
  return jwt.sign(
    { id: agent.id, role: agent.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};

// Vérifie un token avec une clé spécifique
exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
