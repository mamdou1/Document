// controllers/pieceFichier.controller.js
const { PieceFichier } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const path = require("path");

exports.uploadMultipleFiles = async (req, res) => {
  const startTime = Date.now();
  const { typeId, pieceId } = req.params;

  try {
    logger.info("📤 Tentative d'upload de fichiers pour une pièce", {
      typeId,
      pieceId,
      userId: req.user?.id,
      fileCount: req.files?.length || 0,
    });

    if (!req.files || req.files.length === 0) {
      logger.warn("⚠️ Aucun fichier envoyé", {
        typeId,
        pieceId,
        userId: req.user?.id,
      });
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const savedFiles = await Promise.all(
      req.files.map((file) =>
        PieceFichier.create({
          type_id: typeId,
          piece_id: pieceId,
          fichier: file.path,
          original_name: file.originalname,
          new_file_name: path.basename(file.path),
        }),
      ),
    );

    logger.info("✅ Fichiers uploadés avec succès", {
      typeId,
      pieceId,
      count: savedFiles.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "upload",
      resource: "pieceFichier",
      resource_id: null,
      resource_identifier: `Upload de ${savedFiles.length} fichier(s)`,
      description: `Upload de ${savedFiles.length} fichier(s) pour la pièce #${pieceId}`,
      method: req.method,
      path: req.originalUrl,
      status: 201,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        fileCount: savedFiles.length,
        files: savedFiles.map((f) => ({ id: f.id, name: f.original_name })),
        duration: Date.now() - startTime,
      },
    });

    res.status(201).json({
      message: "Fichiers ajoutés avec succès",
      fichiers: savedFiles,
    });
  } catch (err) {
    logger.error("❌ Erreur upload fichiers:", {
      typeId,
      pieceId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.getFilesByPiece = async (req, res) => {
  const startTime = Date.now();
  const { typeId, pieceId } = req.params;

  try {
    logger.debug("🔍 Récupération des fichiers d'une pièce", {
      typeId,
      pieceId,
      userId: req.user?.id,
    });

    const files = await PieceFichier.findAll({
      where: { type_id: typeId, piece_id: pieceId },
      order: [["createdAt", "DESC"]],
    });

    logger.info("✅ Fichiers de la pièce récupérés", {
      typeId,
      pieceId,
      count: files.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(files);
  } catch (err) {
    logger.error("❌ Erreur récupération fichiers:", {
      typeId,
      pieceId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};
