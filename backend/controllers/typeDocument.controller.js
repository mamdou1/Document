const {
  TypeDocument,
  MetaField,
  Pieces,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  sequelize,
} = require("../models");
const buildAccessWhere = require("../utils/buildAccessWhere.utils");

exports.create = async (req, res) => {
  try {
    req.body;
    const payload = req.body;
    const data = await TypeDocument.create(payload);
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    // 1. Extraire uniquement les champs scalaires (pas les objets/tableaux)
    // Assurez-vous d'utiliser les noms exacts de vos colonnes en BD
    const {
      nom,
      code,
      entitee_un_id,
      entitee_deux_id,
      entitee_trois_id,
      division_id,
    } = req.body;

    const [updated] = await TypeDocument.update(
      {
        nom,
        code,
        entitee_un_id,
        entitee_deux_id,
        entitee_trois_id,
        division_id,
      },
      { where: { id: req.params.id } },
    );

    if (updated === 0) {
      return res.status(404).json({
        message:
          "Aucun document trouvé avec cet ID ou aucune modification apportée",
      });
    }

    res.json({ success: true, message: "Mise à jour réussie" });
  } catch (e) {
    console.error("Erreur Update:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await TypeDocument.findAll({
      include: [
        { model: MetaField, as: "metaFields" },
        {
          model: EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code", "titre"], // ✅ Ajoutez code et titre
        },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code", "titre"],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          attributes: ["id", "libelle", "code", "titre"],
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = data.map((td) => {
      const entiteeConcernee =
        td.entitee_trois || td.entitee_deux || td.entitee_un;

      return {
        id: td.id,
        code: td.code,
        nom: td.nom,
        // ✅ AJOUTEZ CES LIGNES - les IDs directs !
        entitee_un_id: td.entitee_un?.id || null,
        entitee_deux_id: td.entitee_deux?.id || null,
        entitee_trois_id: td.entitee_trois?.id || null,

        structure_libelle: entiteeConcernee
          ? entiteeConcernee.libelle
          : "Non assigné",

        // ✅ Gardez les objets complets
        entitee_un: td.entitee_un,
        entitee_deux: td.entitee_deux,
        entitee_trois: td.entitee_trois,

        metaFields: td.metaFields || [],
        pieces: (td.pieces || []).map((p) => ({
          id: p.id,
          libelle: p.libelle,
          code_pieces: p.code_pieces,
        })),
        createdAt: td.createdAt,
        updatedAt: td.updatedAt,
      };
    });

    res.json({ typeDocument: formatted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await TypeDocument.findByPk(req.params.id, {
      include: [
        { model: EntiteeUn },
        { model: EntiteeDeux },
        { model: EntiteeTrois },
        { model: Division },
        { model: MetaField },
      ],
    });

    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await TypeDocument.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.addPiecesToTypeDocument = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { pieces } = req.body;

    const typeDocument = await TypeDocument.findByPk(id);
    if (!typeDocument)
      return res.status(404).json({ message: "Type de document introuvable" });

    for (const p of pieces) {
      await typeDocument.addPiece(p.piece, {
        through: {
          disponible: p.disponible ?? false,
          //fichier: null,
        },
        transaction: t,
      });
    }

    await t.commit();
    res.json({ message: "Pièces ajoutées avec succès" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.removePieceFromTypeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { pieceId } = req.body;

    const typeDocument = await TypeDocument.findByPk(id);
    if (!typeDocument)
      return res.status(404).json({ message: "Type de document introuvable" });

    await typeDocument.removePiece(pieceId);

    res.json({ message: "Pièce supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPiecesOfTypeDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const typeDocument = await TypeDocument.findByPk(id, {
      include: [
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
        },
      ],
    });

    if (!typeDocument) {
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    res.json(typeDocument.pieces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
