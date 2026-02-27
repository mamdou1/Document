// controllers/Pieces.controller.js
const {
  Pieces,
  Division,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  sequelize,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.createPieces = async (req, res) => {
  const startTime = Date.now();

  try {
    const { libelle } = req.body;

    const count = await Pieces.count();

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, "0");
    const code_pieces = `P-${paddedNumber}`;

    logger.info("📝 Tentative de création d'une pièce", {
      userId: req.user?.id,
      body: req.body,
    });

    if (!libelle || !code_pieces) {
      logger.warn("⚠️ Champs requis manquants", {
        libelle,
        code_pieces,
        userId: req.user?.id,
      });
      return res
        .status(400)
        .json({ message: "Le libellé et le code sont requis" });
    }

    const exist = await Pieces.findOne({
      where: { code_pieces: code_pieces.toUpperCase() },
    });

    if (exist) {
      logger.warn("⚠️ Code de pièce déjà existant", {
        code_pieces: code_pieces.toUpperCase(),
        userId: req.user?.id,
      });
      return res.status(400).json({ message: "Ce code de pièce existe déjà" });
    }

    const pieces = await Pieces.create({
      code_pieces: code_pieces.toUpperCase(),
      libelle: libelle.toUpperCase(),
    });

    logger.info("✅ Pièce créée avec succès", {
      pieceId: pieces.id,
      code: pieces.code_pieces,
      libelle: pieces.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "pieces", pieces);

    res.status(201).json(pieces);
  } catch (err) {
    logger.error("❌ Erreur création pièce:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Impossible de créer la pièce" });
  }
};

exports.getPieces = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de toutes les pièces", {
      userId: req.user?.id,
      query: req.query,
    });

    const pieces = await Pieces.findAll();

    logger.info("✅ Pièces récupérées", {
      count: pieces.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "pieces",
        resource_id: null,
        resource_identifier: "liste des pièces",
        description: "Consultation de la liste des pièces",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: pieces.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.status(200).json(pieces);
  } catch (err) {
    logger.error("❌ Erreur récupération pièces:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Impossible de récupérer les types de dépense",
    });
  }
};

exports.updatePieces = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'une pièce", {
      pieceId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldPiece = await Pieces.findByPk(id);
    if (!oldPiece) {
      logger.warn("⚠️ Pièce non trouvée", {
        pieceId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Pièce introuvable" });
    }

    const oldCopy = oldPiece.toJSON();
    const updateData = {
      code_pieces: req.body.code_pieces?.toUpperCase() || oldPiece.code_pieces,
      libelle: req.body.libelle?.toUpperCase() || oldPiece.libelle,
    };

    await oldPiece.update(updateData);

    const updatedPiece = await Pieces.findByPk(id);

    logger.info("✅ Pièce mise à jour avec succès", {
      pieceId: id,
      code: updatedPiece.code_pieces,
      libelle: updatedPiece.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "pieces", oldCopy, updatedPiece);

    res.status(200).json(updatedPiece);
  } catch (err) {
    logger.error("❌ Erreur mise à jour pièce:", {
      pieceId: id,
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

exports.deletePiece = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une pièce", {
      pieceId: id,
      userId: req.user?.id,
    });

    const piece = await Pieces.findByPk(id);
    if (!piece) {
      logger.warn("⚠️ Pièce non trouvée pour suppression", {
        pieceId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    await piece.destroy();

    logger.info("✅ Pièce supprimée avec succès", {
      pieceId: id,
      code: piece.code_pieces,
      libelle: piece.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "pieces", piece);

    res.status(200).json({ message: "Pièce supprimée avec succès" });
  } catch (err) {
    logger.error("❌ Erreur suppression pièce:", {
      pieceId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur suppression pièce", error: err.message });
  }
};
