const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email.utils");
const {
  Agent,
  Droit,
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Permission,
  AgentEntiteeAccess,
} = require("../models");

// Helper pour l'inclusion profonde de la hiérarchie de fonction
const fonctionInclude = {
  model: Fonction,
  as: "fonction_details",
  attributes: ["id", "libelle"],
  include: [
    {
      model: EntiteeUn,
      as: "entitee_un",
      attributes: ["id", "libelle", "code", "titre"],
    },
    {
      model: EntiteeDeux,
      as: "entitee_deux",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code"],
        },
      ],
    },
    {
      model: EntiteeTrois,
      as: "entitee_trois",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle", "code"],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * ✅ Inclusion des accès agent_entitee_access
 */
const agentAccessInclude = {
  model: AgentEntiteeAccess,
  as: "agent_access",
  attributes: ["id", "created_at", "updated_at"],
  include: [
    // ✅ Entitee Un (N1)
    {
      model: EntiteeUn,
      as: "entitee_un",
      attributes: ["id", "libelle", "code", "titre"],
      required: false,
    },
    // ✅ Entitee Deux (N2) avec son parent Entitee Un
    {
      model: EntiteeDeux,
      as: "entitee_deux",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code"],
        },
      ],
      required: false,
    },
    // ✅ Entitee Trois (N3) avec toute sa hiérarchie
    {
      model: EntiteeTrois,
      as: "entitee_trois",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle", "code"],
            },
          ],
        },
      ],
      required: false,
    },
  ],
};

/**
 * ✅ Créer un utilisateur (par ADMIN)
 */
exports.createUser = async (req, res) => {
  try {
    // if (req.user.role !== "ADMIN") {
    //   return res.status(403).json({ message: "Accès refusé" });
    // }

    const {
      nom,
      prenom,
      email,
      telephone,
      num_matricule,
      // role,
      droit,
      fonction,
    } = req.body;

    const existingUser = await Agent.findOne({
      where: { [Op.or]: [{ email }, { telephone }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email ou téléphone déjà utilisé." });
    }

    const passwordGenerated =
      nom.slice(0, 2).toLowerCase() +
      prenom.slice(0, 2).toLowerCase() +
      telephone.replace(/\D/g, "").slice(0, 4);

    const usernames =
      nom.toLowerCase() + telephone.replace(/\D/g, "").slice(0, 2);

    const hashedPassword = await bcrypt.hash(passwordGenerated, 10);
    const photoProfil = req.file ? req.file.filename : "";

    const newUser = await Agent.create({
      nom,
      prenom,
      email,
      telephone,
      num_matricule,
      // role,
      password: hashedPassword,
      username: usernames,
      enregistrer_par_id: req.user.id,
      photo_profil: photoProfil,
      droit_id: droit, // Mapping front 'droit' -> back 'droit_id'
      fonction_id: fonction, // Mapping front 'fonction' -> back 'fonction_id'
    });

    // Email de bienvenue
    const message = `Bonjour ${prenom} ${nom},\n\nIdentifiant : ${usernames}\nMot de passe : ${passwordGenerated}\n`;
    await sendEmail(email, "Bienvenue sur la plateforme", message);

    res.status(201).json({ message: "Utilisateur créé", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Erreur création", error: err.message });
  }
};

/**
 * ✅ Récupérer tous les utilisateurs
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await Agent.findAll({
      attributes: { exclude: ["password"] },
      include: [
        { model: Droit, as: "droit", attributes: ["libelle"] },
        fonctionInclude, // Populate Service/Division/Section
        agentAccessInclude, // Populate accès avec hiérarchie complète
      ],
    });

    console.log(`✅ ${users.length} utilisateurs chargés avec leurs accès`);
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération", erreur: err.message });
  }
};

/**
 * ✅ Récupérer un utilisateur par ID
 */
exports.getUsersById = async (req, res) => {
  try {
    const user = await Agent.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Agent, as: "createur", attributes: ["nom", "prenom"] },
        { model: Droit, as: "droit", attributes: ["id", "libelle"] },
        fonctionInclude,
        agentAccessInclude, // Populate accès avec hiérarchie complète
      ],
    });

    if (!user) return res.status(404).json({ message: "Non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Mise à jour par ADMIN
 */
exports.updateUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Accès refusé" });

    const { id } = req.params;
    const payload = req.body;

    // Mapping des IDs provenant du frontend
    if (payload.droit) {
      payload.droit_id = payload.droit;
      delete payload.droit;
    }
    if (payload.fonction) {
      payload.fonction_id = payload.fonction;
      delete payload.fonction;
    }

    const user = await Agent.findByPk(id);
    if (!user) return res.status(404).json({ message: "Non trouvé" });

    // Vérification unicité si email/tel modifiés
    if (payload.email && payload.email !== user.email) {
      const exist = await Agent.findOne({ where: { email: payload.email } });
      if (exist) return res.status(400).json({ message: "Email utilisé" });
    }

    if (payload.password)
      payload.password = await bcrypt.hash(payload.password, 10);
    if (req.file) payload.photo_profil = req.file.filename;

    await user.update(payload);
    const { password, ...safeUser } = user.toJSON();
    res.json({ message: "Mis à jour", user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Mise à jour par ADMIN
 */

exports.updateUserProfil = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Agent.findByPk(id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const payload = req.body;

    // ✅ MAPPING ICI Par ce que dans le frontend c'est : droit et dans le backend c'est droit_id
    if (payload.droit !== undefined) {
      payload.droit_id = payload.droit;
      delete payload.droit;
    }

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    if (req.file) {
      payload.photo_profil = req.file.filename;
    }

    await user.update(payload);
    console.log("🔎 UserHimSelfUpdate ID résolu :", user);

    const { password, ...safeUser } = user.toJSON();

    res.json({
      message: "Profil mis à jour avec succès",
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur mise à jour profil",
      error: err.message,
    });
  }
};

/**
 * ✅ Suppression
 */
exports.deleteMembre = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Interdit" });
    const user = await Agent.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Introuvable" });

    await user.destroy();
    res.json({ message: "Supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token manquant" });

    console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    const agent = await Agent.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: [
        fonctionInclude,
        agentAccessInclude, // Populate accès avec hiérarchie complète
        {
          model: Droit,
          as: "droit",
          attributes: ["id", "libelle", "createdAt", "updatedAt"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["id", "resource", "action"],
            },
          ],
        },
      ],
    });

    console.log(agent);

    if (!agent) return res.status(404).json({ message: "Agent non trouvé" });

    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.countMembres = async (req, res) => {
  try {
    const count = await Agent.count({
      where: {
        role: { [Op.in]: ["MEMBRE", "MEMBRE_AUTHORIZE"] },
      },
    });

    res.json({ totalMembres: count });
  } catch (err) {
    res.status(500).json({
      message: "Erreur comptage membres",
      error: err.message,
    });
  }
};
