const bcrypt = require("bcrypt");
const { Agent, Token } = require("../models");
const { sendEmail } = require("../utils/email.utils");
const HistoriqueService = require("../services/historique.service");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/token.utils");

// 🔹 Inscription
exports.inscription = async (req, res) => {
  try {
    const {
      num_matricule,
      fonction,
      service_division,
      email,
      telephone,
      password,
      nom,
      prenom,
    } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await Agent.create({
      fonction,
      password: hash,
      role: "ADMIN",
      telephone,
      nom,
      num_matricule,
      prenom,
      email,
      service_division,
    });

    const userAdmin = await Agent.findByPk(user.id);

    res.status(201).json({
      message: "Inscription réussie",
      userAdmin,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Connexion
// exports.connexion = async (req, res) => {
//   try {
//     const { telephone, password } = req.body;
//     const agent = await Agent.findOne({ where: { telephone } });
//     if (!agent)
//       return res.status(404).json({ message: "Utilisateur non trouvé." });
//     const valid = await bcrypt.compare(password, agent.password);
//     if (!valid)
//       return res.status(401).json({ message: "Mot de passe incorrect" });
//     const accessToken = generateAccessToken(agent);
//     const refreshToken = generateRefreshToken(agent);
//     await Token.create({ token: refreshToken, agent_id: agent.id });
//     res.json({ accessToken, refreshToken });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.connexion = async (req, res) => {
  try {
    const { telephone, password } = req.body;
    console.log("📞 Tentative de connexion avec téléphone :", telephone);

    const agent = await Agent.findOne({ where: { telephone } });
    if (!agent) {
      console.log("❌ Aucun agent trouvé pour ce téléphone :", telephone);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    console.log("✅ Agent trouvé :", agent.id, agent.nom, agent.prenom);

    const valid = await bcrypt.compare(password, agent.password);
    if (!valid) {
      console.log("⚠️ Mot de passe incorrect pour l’agent ID :", agent.id);
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    console.log("🔑 Mot de passe validé pour l’agent ID :", agent.id);

    const accessToken = generateAccessToken(agent);
    const refreshToken = generateRefreshToken(agent);

    console.log(
      "🎟️ AccessToken généré (début) :",
      accessToken.substring(0, 20),
      "...",
    );
    console.log(
      "🎟️ RefreshToken généré (début) :",
      refreshToken.substring(0, 20),
      "...",
    );

    await Token.create({ token: refreshToken, agent_id: agent.id });

    await HistoriqueService.log({
      agent_id: agent.id,
      action: "login",
      resource: "auth/connexion",
      resource_id: req.params.pieceId,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: req.files?.map((f) => f.filename),
    });
    console.log(
      "💾 RefreshToken enregistré en base pour l’agent ID :",
      agent.id,
    );

    res.json({ accessToken, refreshToken });
    console.log("✅ Connexion réussie pour l’agent ID :", agent.id);
  } catch (err) {
    console.error("🔥 Erreur lors de la connexion :", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Rafraîchir le token
exports.refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(403).json({ message: "Token manquant" });

  const stored = await Token.findOne({ where: { token } });
  if (!stored)
    return res.status(403).json({ message: "Refresh token invalide" });

  try {
    const decoded = verifyToken(token, process.env.REFRESH_SECRET);

    const freshAccess = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    res.json({ accessToken: freshAccess });
  } catch {
    res.status(403).json({ message: "Token expiré" });
  }
};

// 🔹 Déconnexion
exports.deconnexion = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token requis" });

    await Token.destroy({ where: { token } });

    await HistoriqueService.log({
      agent_id: req.user.id,
      action: "logout", // ✅ action correcte pour une déconnexion
      resource: "auth/deconnexion",
      resource_id: req.user.id,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Envoi du code de vérification
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Agent.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await user.update({
      code_verification: code,
      reset_code_expiry: Date.now() + 86400000,
      is_verified_for_reset: false,
    });

    await sendEmail(email, "Réinitialisation", `Code: ${code}`);

    const token = generateAccessToken({
      id: user.id,
      purpose: "reset-password",
    });

    res.json({ token, message: "Code envoyé par email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Vérification du code et réinitialisation
exports.verifyAndReset = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { code } = req.body;
    if (!token) return res.status(401).json({ message: "Token manquant" });

    const decoded = verifyToken(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "reset-password")
      return res.status(401).json({ message: "Token invalide" });

    const user = await Agent.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (!user.codeVerification || user.codeVerification !== code)
      return res.status(400).json({ message: "Code de vérification invalide" });

    if (Date.now() > user.resetCodeExpiry)
      return res.status(400).json({ message: "Code expiré" });

    user.password = await bcrypt.hash("Temp1234", 10);
    user.codeVerification = null;
    user.resetCodeExpiry = null;
    user.isVerifiedForReset = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Mot de passe réinitialisé à 'Temp1234'." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Mise à jour du mot de passe temporaire
exports.updatePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { newPassword } = req.body;
    if (!token) return res.status(401).json({ message: "Token manquant" });

    const decoded = verifyToken(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "reset-password")
      return res.status(401).json({ message: "Token invalide" });

    const user = await Agent.findByPk(decoded.id);
    if (!user || !user.isVerifiedForReset)
      return res.status(403).json({ message: "Accès refusé" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.isVerifiedForReset = false;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Changer le mot de passe après connexion
exports.changerPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Agent.findByPk(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
