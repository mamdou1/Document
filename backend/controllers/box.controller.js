const { Box, Document } = require("../models");

// --- Méthodes de gestion de Box ---

exports.create = async (req, res) => {
  try {
    const data = await Box.create({
      ...req.body,
      current_count: 0, // Initialisation sécurisée
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du box",
      error: error.message,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await Box.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des box",
      error: error.message,
    });
  }
};

exports.findById = async (req, res) => {
  try {
    const data = await Box.findByPk(req.params.id, {
      include: [
        {
          model: Document,
          as: "documents", // <--- L'alias défini dans Box.associate
        },
      ],
    });
    if (!data) return res.status(404).json({ message: "Box non trouvé" });
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du box",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { current_count, ...updateData } = req.body;
    const [updated] = await Box.update(updateData, {
      where: { id: req.params.id },
    });

    if (updated === 0)
      return res
        .status(404)
        .json({ message: "Box non trouvé ou aucune modification" });
    res.json({ success: true, message: "Box mis à jour" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const box = await Box.findByPk(req.params.id);
    if (!box) return res.status(404).json({ message: "Box non trouvé" });

    if (box.current_count > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer un box contenant des documents",
      });
    }

    await Box.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "Box supprimé" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

// --- Logique d'archivage (Ajout/Retrait) ---

exports.addDocumentToBox = async (req, res) => {
  try {
    const { boxId, documentId } = req.params;
    const box = await Box.findByPk(boxId);
    const doc = await Document.findByPk(documentId);

    if (!box || !doc)
      return res.status(404).json({ message: "Box ou Document introuvable" });

    // Vérification Capacité
    if (box.current_count >= box.capacite_max) {
      return res
        .status(400)
        .json({ message: "Capacité maximale atteinte pour ce box" });
    }

    // Vérification Type
    if (box.type_document_id && box.type_document_id !== doc.type_document_id) {
      return res
        .status(400)
        .json({ message: "Le type de document ne correspond pas à ce box" });
    }

    // Mise à jour
    if (!box.type_document_id) box.type_document_id = doc.type_document_id;
    box.current_count += 1;
    doc.box_id = box.id;

    await box.save();
    await doc.save();

    res.json({ success: true, current_count: box.current_count });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout du document",
      error: error.message,
    });
  }
};

exports.retireDocumentToBox = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.documentId);
    if (!doc || !doc.box_id)
      return res
        .status(404)
        .json({ message: "Document non trouvé ou déjà hors box" });

    const box = await Box.findByPk(doc.box_id);
    if (box) {
      box.current_count = Math.max(0, box.current_count - 1);
      if (box.current_count === 0) box.type_document_id = null;
      await box.save();
    }

    doc.box_id = null;
    await doc.save();

    res.json({ success: true, message: "Document retiré avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du retrait du document",
      error: error.message,
    });
  }
};

exports.getAllDocumentByBox = async (req, res) => {
  try {
    const data = await Document.findAll({ where: { box_id: req.params.id } });
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des documents",
      error: error.message,
    });
  }
};
