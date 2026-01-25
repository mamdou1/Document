const { Op } = require("sequelize");
const {
  Liquidation,
  Nature,
  Chapitre,
  Programme,
  Pieces,
  Fournisseur,
  ServiceBeneficiaire,
  Type,
  LiquidationPieces,
  sequelize,
  PiecesFichier,
  TypePieces,
  Division,
  SourceDeFinancement,
} = require("../models");
const path = require("path");

class LiquidationController {
  // controllers/LiquidationController.js
  static async create(req, res) {
    const t = await sequelize.transaction();

    try {
      const {
        type,
        fournisseur,
        description,
        serviceBeneficiaire,
        numDossier,
        montant,
        programme,
        chapitre,
        nature,
        source_de_financement,
      } = req.body;

      if (
        !type ||
        !programme ||
        !chapitre ||
        !nature ||
        !montant ||
        !fournisseur ||
        !source_de_financement
      )
        return res
          .status(400)
          .json({ message: "Champs obligatoires manquants" });

      const typeDoc = await Type.findByPk(type, {
        include: [{ model: Pieces, as: "pieces" }],
        transaction: t,
      });

      if (!typeDoc) return res.status(400).json({ message: "Type invalide" });

      const liquidation = await Liquidation.create(
        {
          description,
          source_de_financement_id: source_de_financement,
          num_dossier: numDossier,
          montant,
          programme_id: programme,
          chapitre_id: chapitre,
          nature_id: nature,
          type_id: type,
          fournisseur_id: fournisseur,
          service_beneficiaire_id: serviceBeneficiaire,
        },
        { transaction: t },
      );

      const typePieces = await TypePieces.findAll({
        where: { type_id: type },
        transaction: t,
      });

      const rows = typePieces.map((tp) => ({
        liquidation_id: liquidation.id,
        piece_id: tp.piece_id,
        disponible: false,
      }));

      await LiquidationPieces.bulkCreate(rows, { transaction: t });

      await t.commit();

      const result = await Liquidation.findByPk(liquidation.id, {
        include: [
          { model: Type, as: "type" },
          { model: Fournisseur, as: "fournisseur" },
          { model: SourceDeFinancement, as: "sourceDeFinancement" },
          {
            model: Type,
            as: "type",
            include: [
              {
                model: Pieces,
                as: "pieces",
                attributes: ["id", "libelle", "code_pieces"],
                through: {
                  model: TypePieces,
                  attributes: [], // pas dispo ici
                },
                include: [
                  {
                    model: PiecesFichier,
                    as: "fichiers",
                    required: false,
                    where: { liquidation_id: liquidation.id },
                  },
                ],
              },
            ],
          },
        ],
      });

      res.status(201).json({ data: result });
    } catch (err) {
      if (!t.finished) await t.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const {
        nature,
        chapitre,
        programme,
        exercice,
        dateFrom,
        dateTo,
        page = 1,
        limit = 50,
      } = req.query;

      const where = {};

      if (nature) where.nature_id = nature;

      /* 🔁 Cascade */
      if (chapitre || programme || exercice) {
        let chapitresIds = [];

        if (chapitre) {
          chapitresIds = [chapitre];
        } else if (programme) {
          const chs = await Chapitre.findAll({
            where: { programme_id: programme },
            attributes: ["id"],
          });
          chapitresIds = chs.map((c) => c.id);
        } else if (exercice) {
          const progs = await Programme.findAll({
            where: { exercice_id: exercice },
            attributes: ["id"],
          });

          const chs = await Chapitre.findAll({
            where: { programme_id: progs.map((p) => p.id) },
            attributes: ["id"],
          });

          chapitresIds = chs.map((c) => c.id);
        }

        if (!chapitresIds.length) {
          return res.json({ data: [], total: 0, page, limit });
        }

        const natures = await Nature.findAll({
          where: { chapitre_id: { [Op.in]: chapitresIds } },
          attributes: ["id"],
        });

        if (!natures.length) {
          return res.json({ data: [], total: 0, page, limit });
        }

        where.nature_id = { [Op.in]: natures.map((n) => n.id) };
      }

      /* 📅 Date */
      if (dateFrom || dateTo) {
        where.date_liquidation = {};
        if (dateFrom) where.date_liquidation[Op.gte] = new Date(dateFrom);
        if (dateTo) where.date_liquidation[Op.lte] = new Date(dateTo);
      }

      const offset = (page - 1) * limit;

      const { rows, count } = await Liquidation.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        distinct: true, // 🔥 IMPORTANT avec belongsToMany
        include: [
          {
            model: Nature,
            as: "nature",
            include: [
              {
                model: Chapitre,
                as: "chapitre",
                include: [
                  {
                    model: Programme,
                    as: "programme",
                  },
                ],
              },
            ],
          },
          {
            model: Fournisseur,
            as: "fournisseur",
            attributes: ["id", "NIF", "sigle", "raisonSocial"],
          },
          {
            model: ServiceBeneficiaire,
            as: "serviceBeneficiaire",
            attributes: ["id", "codeService", "libelle", "sigle"],
          },
          {
            model: SourceDeFinancement,
            as: "sourceDeFinancement",
            attributes: ["id", "libelle"],
          },
          {
            model: Type,
            as: "type",
            attributes: ["id", "nom"],
            include: [
              {
                model: Pieces,
                as: "pieces",
                attributes: ["id", "libelle", "code_pieces"],
                through: {
                  model: TypePieces,
                  attributes: [], // pas dispo ici
                },
                include: [
                  {
                    model: PiecesFichier,
                    as: "fichiers",
                    required: false,
                  },
                  {
                    model: Division,
                    as: "division",
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: Pieces,
            as: "pieces",
            attributes: ["id", "libelle", "code_pieces"],
            through: {
              model: LiquidationPieces,
              attributes: ["disponible"],
            },
            include: [
              {
                model: PiecesFichier,
                as: "fichiers",
                required: false,
              },
              {
                model: Division,
                as: "division",
                required: false,
              },
            ],
          },
        ],
        order: [["date_liquidation", "DESC"]],
      });

      return res.json({
        data: rows,
        total: count,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getOne(req, res) {
    try {
      const { id } = req.params;

      const liq = await Liquidation.findByPk(id, {
        include: [
          {
            model: Nature,
            as: "nature",
            include: [
              {
                model: Chapitre,
                as: "chapitre",
                include: [
                  {
                    model: Programme,
                    as: "programme",
                  },
                ],
              },
            ],
          },
          {
            model: Fournisseur,
            as: "fournisseur",
            attributes: ["id", "NIF", "sigle", "raisonSocial"],
          },
          {
            model: ServiceBeneficiaire,
            as: "serviceBeneficiaire",
            attributes: ["id", "codeService", "libelle", "sigle"],
          },
          {
            model: SourceDeFinancement,
            as: "sourceDeFinancement",
            attributes: ["id", "libelle"],
          },
          {
            model: Type,
            as: "type",
            attributes: ["id", "nom"],
            include: [
              {
                model: Pieces,
                as: "pieces",
                attributes: ["id", "libelle", "code_pieces"],
                through: {
                  model: TypePieces,
                  attributes: [], // pas dispo ici
                },
                include: [
                  {
                    model: PiecesFichier,
                    as: "fichiers",
                    required: false,
                  },
                  {
                    model: Division,
                    as: "division",
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: Pieces,
            as: "pieces",
            attributes: ["id", "libelle", "code_pieces"],
            through: {
              model: LiquidationPieces,
              attributes: ["disponible"],
            },
            include: [
              {
                model: PiecesFichier,
                as: "fichiers",
                required: false,
              },
              {
                model: Division,
                as: "division",
                required: false,
              },
            ],
          },
        ],
      });

      if (!liq)
        return res.status(404).json({ message: "Liquidation non trouvée" });

      res.json(liq);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;

      if (payload.nature_id) {
        const n = await Nature.findByPk(payload.nature_id);
        if (!n) return res.status(404).json({ message: "Nature non trouvée" });
      }

      const liq = await Liquidation.findByPk(id);
      if (!liq)
        return res.status(404).json({ message: "Liquidation non trouvée" });

      await liq.update(payload);

      const updated = await Liquidation.findByPk(id, {
        include: [Nature, Fournisseur, ServiceBeneficiaire, Type],
      });

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const liq = await Liquidation.findByPk(id);
      if (!liq)
        return res.status(404).json({ message: "Liquidation non trouvée" });

      await liq.destroy();
      res.json({ message: "Liquidation supprimée" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async uploadPieceFiles(req, res) {
    const t = await sequelize.transaction();
    try {
      const { liquidationId, pieceId, typeId } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Aucun fichier uploadé" });
      }

      // 🔒 Vérifier que la pièce est bien requise pour ce type
      const relation = await TypePieces.findOne({
        where: { type_id: typeId, piece_id: pieceId },
        transaction: t,
      });

      if (!relation) {
        await t.rollback();
        return res
          .status(403)
          .json({ message: "Pièce non autorisée pour ce type" });
      }

      // 📎 Créer une entrée DB par fichier

      const records = req.files.map((file) => {
        const publicPath = file.path
          .replace(/\\/g, "/") // Windows → URL
          .replace(/^.*uploads\//, "uploads/"); // garde seulement "uploads/..."

        return {
          liquidation_id: liquidationId,
          piece_id: pieceId,
          fichier: publicPath, // ex: "uploads/liquidations/LIQ-13/EXPRESSION_DE_BESOIN/2026-01-12_xxx.pdf"
          original_name: file.originalname,
        };
      });

      await PiecesFichier.bulkCreate(records, { transaction: t });

      await t.commit();

      res.json({
        message: "Fichiers ajoutés avec succès",
        fichiers: records,
      });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // PATCH /liquidations/:liquidationId/pieces/:pieceId/disponible

  static async updatePieceDisponibilite(req, res) {
    try {
      const { liquidationId, pieceId } = req.params;
      const { disponible } = req.body;

      const [lp] = await LiquidationPieces.findOrCreate({
        where: {
          liquidation_id: liquidationId,
          piece_id: pieceId,
        },
        defaults: {
          disponible: false,
        },
      });

      if (!lp) {
        return res
          .status(404)
          .json({ message: "Relation liquidation/pièce introuvable" });
      }

      lp.disponible = disponible;
      await lp.save();

      return res.json({
        message: "Disponibilité mise à jour",
        disponible: lp.disponible,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur update disponibilité" });
    }
  }

  static async getPieceFiles(req, res) {
    try {
      const { liquidationId, pieceId } = req.params;

      const files = await PiecesFichier.findAll({
        where: {
          liquidation_id: liquidationId,
          piece_id: pieceId,
        },
        order: [["created_at", "DESC"]],
      });

      return res.json(files);
    } catch (error) {
      console.error("❌ getPieceFiles error:", error);
      return res.status(500).json({
        message: "Erreur lors de la récupération des fichiers",
      });
    }
  }

  //

  static async getLiquidationPieces(req, res) {
    try {
      const { liquidationId } = req.params;

      const liquidation = await Liquidation.findByPk(liquidationId, {
        include: [
          {
            model: Type,
            include: [
              {
                model: Pieces,
                as: "pieces",
                attributes: ["id", "libelle", "code_pieces"],
                through: {
                  model: TypePieces,
                  attributes: [], // pas dispo ici
                },
                include: [
                  {
                    model: PiecesFichier,
                    as: "fichiers",
                    where: { liquidation_id: liquidationId },
                    required: false, // important
                    attributes: ["id", "fichier", "original_name", "createdAt"],
                  },
                ],
              },
            ],
          },
          {
            model: Pieces,
            as: "pieces",
            attributes: ["id", "libelle", "code_pieces"],
            through: {
              model: LiquidationPieces,
              attributes: ["disponible"],
            },
          },
        ],
      });

      if (!liquidation)
        return res.status(404).json({ message: "Liquidation introuvable" });

      // 🎯 Flatten propre pour le frontend
      const pieces = liquidation.Type.Pieces.map((p) => ({
        id: p.id,
        libelle: p.libelle,
        code_pieces: p.code_pieces,
        disponible: p.liquidation_pieces.disponible ?? false,
        fichiers: p.fichiers || [],
      }));

      res.json({ pieces });
    } catch (error) {
      console.error("🔥 getLiquidationPieces error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = LiquidationController;
