const axios = require("axios");
const fs = require("fs");
const path = require("path");

const {
  sequelize,
  Document,
  TypeDocument,
  MetaField,
  DocumentValue,
  Pieces,
  PieceMetaField,
  PieceValue,
  TypeDocumentPieces,
  DocumentPieces,
  DocumentFichier,
  PiecesFichier,
} = require("../models");

const { downloadFile } = require("../services/downloadFile.service");

const DGCC_URL = "http://localhost:5000";

// const axios = require("axios");
// const { Pieces, PieceMetaField, sequelize } = require("../models");

// const DGCC_API = "http://localhost:5000/api/pieces";

// exports.syncPiecesFormDGCC = async () => {
//   try {
//     console.log("🔄 Synchronisation des pièces depuis DGCC...");

//     const token =
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzcyNDQ2NjY5LCJleHAiOjE3NzI1MzMwNjl9.aeeIsvLMQno60USyFoFieT3LQb6TsMybACLc9VphwOU";

//     const response = await axios.get(DGCC_API, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const dgccPieces = response.data;

//     console.log(`📦 ${dgccPieces.length} pièces reçues`);

//     let created = 0;
//     let skipped = 0;

//     for (const piece of dgccPieces) {
//       // vérifier si existe déjà
//       const exists = await Pieces.findOne({
//         where: {
//           code_pieces: piece.code_pieces,
//         },
//       });

//       if (!exists) {
//         await Pieces.create({
//           code_pieces: piece.code_pieces,
//           libelle: piece.libelle,
//         });

//         created++;
//         console.log(`✅ Créé : ${piece.code_pieces}`);
//       } else {
//         skipped++;
//         console.log(`⏭️ Existe déjà : ${piece.code_pieces}`);
//       }
//     }

//     console.log("=================================");
//     console.log(`✅ Créés : ${created}`);
//     console.log(`⏭️ Ignorés : ${skipped}`);
//     console.log("🎉 Synchronisation terminée");
//   } catch (error) {
//     console.log("❌ Erreur sync DGCC:", error.message);
//   }
// };

/*
    =====================================
     DGCC PIECES
    =====================================
    */

exports.syncPiecesFormDGCC = async () => {
  const transaction = await sequelize.transaction();
  try {
    console.log("🔄 Synchronisation des pièces depuis DGCC...");

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzcyNDQ2NjY5LCJleHAiOjE3NzI1MzMwNjl9.aeeIsvLMQno60USyFoFieT3LQb6TsMybACLc9VphwOU";

    /*
    =====================================
    1. FETCH DGCC PIECES
    =====================================
    */

    const { data: dgccPieces } = await axios.get(`${DGCC_URL}/api/pieces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`📦 ${dgccPieces.length} pièces reçues`);

    /*
    =====================================
    2. FETCH LOCAL PIECES
    =====================================
    */

    const localPieces = await Pieces.findAll({
      attributes: ["id", "code_pieces"],
      transaction,
    });

    /*
    Map rapide
    */

    const localPieceMap = new Map();

    localPieces.forEach((piece) => {
      localPieceMap.set(piece.code_pieces, piece);
    });

    /*
    =====================================
    3. PREPARER LES NOUVELLES PIECES
    =====================================
    */

    const piecesToCreate = [];

    dgccPieces.forEach((piece) => {
      if (!localPieceMap.has(piece.code_pieces)) {
        piecesToCreate.push({
          code_pieces: piece.code_pieces,
          libelle: piece.libelle,
        });
      }
    });

    /*
    =====================================
    4. BULK CREATE PIECES
    =====================================
    */

    let createdPieces = [];

    if (piecesToCreate.length > 0) {
      createdPieces = await Pieces.bulkCreate(piecesToCreate, {
        transaction,
        returning: true,
      });

      console.log(`✅ ${createdPieces.length} nouvelles pièces créées`);

      createdPieces.forEach((piece) => {
        localPieceMap.set(piece.code_pieces, piece);
      });
    }

    /*
    =====================================
    5. FETCH LOCAL META FIELDS
    =====================================
    */

    const localMetaFields = await PieceMetaField.findAll({
      attributes: ["piece_id", "name"],
      transaction,
    });

    const metaSet = new Set();

    localMetaFields.forEach((meta) => {
      metaSet.add(`${meta.piece_id}-${meta.name}`);
    });

    /*
    =====================================
    6. PREPARER META FIELDS
    =====================================
    */

    const metaToCreate = [];

    dgccPieces.forEach((dgccPiece) => {
      const localPiece = localPieceMap.get(dgccPiece.code_pieces);

      if (!localPiece) return;

      if (!dgccPiece.metaFields || dgccPiece.metaFields.length === 0) return;

      dgccPiece.metaFields.forEach((meta) => {
        const key = `${localPiece.id}-${meta.name}`;

        if (!metaSet.has(key)) {
          metaToCreate.push({
            piece_id: localPiece.id,
            name: meta.name,
            label: meta.label,
            field_type: meta.field_type,
            required: meta.required,
            position: meta.position,
          });

          metaSet.add(key);
        }
      });
    });

    /*
    =====================================
    7. BULK CREATE META FIELDS
    =====================================
    */

    if (metaToCreate.length > 0) {
      await PieceMetaField.bulkCreate(metaToCreate, {
        transaction,
      });

      console.log(`🧩 ${metaToCreate.length} metaFields créés`);
    }

    /*
    =====================================
    COMMIT
    =====================================
    */

    await transaction.commit();

    console.log("🎉 Synchronisation PRO terminée");
  } catch (error) {
    await transaction.rollback();

    console.error("❌ Sync error:", error.message);
  }
};

/*
=====================================
 DGCC DOCUMENTS BY ID (COMPLET)
=====================================
*/
exports.syncFullDocumentFromDGCC = async (documentId) => {
  try {
    console.log(`🔄 Sync document complet ID: ${documentId}...`);

    const token = process.env.DGCC_TOKEN;

    /*
    ========================================
    1️⃣ FETCH DOCUMENT COMPLET DGCC
    ========================================
    */

    const { data: dgccDoc } = await axios.get(
      `${DGCC_URL}/api/documents/${documentId}/full`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    /*
    ========================================
    2️⃣ UTILISER LE SYNC SINGLE DOCUMENT
    ========================================
    */

    const localDocument = await exports.syncSingleDocument(dgccDoc);

    console.log(`🎉 Document ${documentId} synchronisé avec succès`);
    return localDocument;
  } catch (error) {
    console.error(`❌ Erreur sync document ${documentId}:`, error.message);
    throw error;
  }
};

/*
=====================================
 DGCC DOCUMENTS (TOUS)
=====================================
*/
exports.syncAllDocumentsFromDGCC = async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log("🔄 Synchronisation de TOUS les documents...");

    const token = process.env.DGCC_TOKEN;

    /*
    ========================================
    1️⃣ FETCH TOUS LES DOCUMENTS
    ========================================
    */

    const { data: dgccDocuments } = await axios.get(
      `${DGCC_URL}/api/documents/full`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log(`📦 ${dgccDocuments.length} documents reçus`);

    /*
    ========================================
    2️⃣ LOOP SUR CHAQUE DOCUMENT (MÊME TRANSACTION)
    ========================================
    */

    const results = [];
    for (const dgccDoc of dgccDocuments) {
      console.log(`➡️ Sync document DGCC ID: ${dgccDoc.id}`);

      // Passer la transaction existante
      const localDoc = await exports.syncSingleDocument(dgccDoc, {
        transaction,
      });
      results.push(localDoc);
    }

    await transaction.commit();
    console.log(`🎉 ${results.length} documents synchronisés avec succès`);
    return results;
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Erreur sync ALL documents:", error.message);
    throw error;
  }
};

/*
=====================================
 SYNC SINGLE DOCUMENT (UTILITAIRE)
=====================================
*/
exports.syncSingleDocument = async (dgccDoc, options = {}) => {
  const { transaction: externalTransaction } = options;

  // Utiliser la transaction externe si fournie, sinon en créer une nouvelle
  const shouldCommit = !externalTransaction;
  const transaction = externalTransaction || (await sequelize.transaction());

  try {
    console.log(`🔄 Synchronisation du document ${dgccDoc.id}...`);

    /*
    ========================================
    1️⃣ SYNC TYPE DOCUMENT
    ========================================
    */

    let localType = await TypeDocument.findOne({
      where: { code: dgccDoc.typeDocument.code },
      transaction,
    });

    if (!localType) {
      localType = await TypeDocument.create(
        {
          code: dgccDoc.typeDocument.code,
          nom: dgccDoc.typeDocument.nom,
        },
        { transaction },
      );
    }

    /*
    ========================================
    2️⃣ SYNC META FIELDS TYPE
    ========================================
    */

    const metaMap = new Map();

    for (const meta of dgccDoc.typeDocument.metaFields) {
      let localMeta = await MetaField.findOne({
        where: {
          type_document_id: localType.id,
          name: meta.name,
        },
        transaction,
      });

      if (!localMeta) {
        localMeta = await MetaField.create(
          {
            type_document_id: localType.id,
            name: meta.name,
            label: meta.label,
            field_type: meta.field_type,
            required: meta.required,
            position: meta.position,
          },
          { transaction },
        );
      }

      metaMap.set(meta.name, localMeta);
    }

    /*
    ========================================
    3️⃣ SYNC DOCUMENT_TYPE_PIECES
    ========================================
    */

    for (const dgccPiece of dgccDoc.pieces) {
      const localPiece = await Pieces.findOne({
        where: { code_pieces: dgccPiece.code_pieces },
        transaction,
      });

      if (!localPiece) continue;

      await TypeDocumentPieces.findOrCreate({
        where: {
          document_type_id: localType.id,
          piece_id: localPiece.id,
        },
        defaults: {
          document_type_id: localType.id,
          piece_id: localPiece.id,
        },
        transaction,
      });
    }

    /*
    ========================================
    4️⃣ CREATE DOCUMENT
    ========================================
    */

    const localDocument = await Document.create(
      {
        type_document_id: localType.id,
      },
      { transaction },
    );

    /*
    ========================================
    5️⃣ SYNC DOCUMENT_PIECES (AVEC DISPONIBLE)
    ========================================
    */

    for (const dgccPiece of dgccDoc.pieces) {
      const localPiece = await Pieces.findOne({
        where: { code_pieces: dgccPiece.code_pieces },
        transaction,
      });

      if (!localPiece) continue;

      const disponible = dgccPiece.DocumentPieces?.disponible ?? false;

      const [docPiece, created] = await DocumentPieces.findOrCreate({
        where: {
          document_id: localDocument.id,
          piece_id: localPiece.id,
        },
        defaults: {
          disponible: disponible,
        },
        transaction,
      });

      if (!created && docPiece.disponible !== disponible) {
        docPiece.disponible = disponible;
        await docPiece.save({ transaction });
      }
    }

    /*
    ========================================
    6️⃣ RÉCUPÉRER LES INFORMATIONS D'ARBORESCENCE
    ========================================
    */

    // Déterminer l'entité concernée (priorité à la plus petite entité)
    let entiteeConcernee = null;
    let titre = null;
    let libelle = null;

    if (localType.entitee_trois_id) {
      entiteeConcernee = await EntiteeTrois.findByPk(
        localType.entitee_trois_id,
        { transaction },
      );
      titre = entiteeConcernee?.titre || "ENTITEE_TROIS";
      libelle = entiteeConcernee?.libelle || "LIBELLE_INCONNU";
    } else if (localType.entitee_deux_id) {
      entiteeConcernee = await EntiteeDeux.findByPk(localType.entitee_deux_id, {
        transaction,
      });
      titre = entiteeConcernee?.titre || "ENTITEE_DEUX";
      libelle = entiteeConcernee?.libelle || "LIBELLE_INCONNU";
    } else if (localType.entitee_un_id) {
      entiteeConcernee = await EntiteeUn.findByPk(localType.entitee_un_id, {
        transaction,
      });
      titre = entiteeConcernee?.titre || "ENTITEE_UN";
      libelle = entiteeConcernee?.libelle || "LIBELLE_INCONNU";
    } else {
      titre = "ENTITEE_INCONNUE";
      libelle = "LIBELLE_INCONNU";
    }

    const typeDocLibelle =
      localType.nom?.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_") ||
      "TYPE_INCONNU";

    console.log("📁 Titre:", titre);
    console.log("📁 Libellé entité:", libelle);
    console.log("📁 Type document:", typeDocLibelle);

    /*
    ========================================
    7️⃣ CREATE DOCUMENT VALUES + FILES (AVEC DOCUMENT_VALUE_ID)
    ========================================
    */

    const documentValueMap = new Map();

    for (const value of dgccDoc.values) {
      const localMeta = metaMap.get(value.metaField.name);

      if (!localMeta) {
        console.warn(`⚠️ MetaField non trouvé: ${value.metaField.name}`);
        continue;
      }

      const createdValue = await DocumentValue.create(
        {
          document_id: localDocument.id,
          meta_field_id: localMeta.id,
          value: value.value,
        },
        { transaction },
      );

      documentValueMap.set(localMeta.id, createdValue.id);

      // ===== SYNC DOCUMENT FILE =====
      if (value.file) {
        const fileName = value.file.new_file_name || value.file.filename;

        // Construire le chemin selon l'arborescence du middleware
        // fichiers -> [TITRE_ENTITE] -> [LIBELLE_ENTITE] -> [NOM_TYPE_DOCUMENT] -> DOC-[documentId]
        const relativeDir = path.join(
          "importation",
          titre,
          libelle,
          typeDocLibelle,
          `DOC-${localDocument.id}`,
        );

        const fileDir = path.join(process.cwd(), relativeDir);
        const filePath = path.join(fileDir, fileName);

        // Créer le dossier si nécessaire
        fs.mkdirSync(fileDir, { recursive: true });

        await downloadFile(`${DGCC_URL}/${value.file.fichier}`, filePath);

        await DocumentFichier.create(
          {
            document_id: localDocument.id,
            piece_id: null,
            piece_value_id: null,
            document_value_id: createdValue.id,
            fichier: path.join(relativeDir, fileName).replace(/\\/g, "/"),
            original_name: value.file.original_name,
            new_file_name: fileName,
            mode: "INDIVIDUEL",
          },
          { transaction },
        );
      }
    }

    /*
    ========================================
    8️⃣ SYNC PIECE META + VALUES + FILES (AVEC DOCUMENT_VALUE_ID)
    ========================================
    */

    for (const dgccPiece of dgccDoc.pieces) {
      const localPiece = await Pieces.findOne({
        where: { code_pieces: dgccPiece.code_pieces },
        transaction,
      });

      if (!localPiece) continue;

      // Nettoyer le libellé de la pièce pour le chemin
      const pieceLibelle = localPiece.libelle
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "_")
        .toUpperCase()
        .substring(0, 50);

      const pieceMetaMap = new Map();

      // ===== META FIELDS =====
      for (const meta of dgccPiece.metaFields || []) {
        let localMeta = await PieceMetaField.findOne({
          where: {
            piece_id: localPiece.id,
            name: meta.name,
          },
          transaction,
        });

        if (!localMeta) {
          localMeta = await PieceMetaField.create(
            {
              piece_id: localPiece.id,
              name: meta.name,
              label: meta.label,
              field_type: meta.field_type,
              required: meta.required,
              position: meta.position,
            },
            { transaction },
          );
        }

        pieceMetaMap.set(meta.name, localMeta);
      }

      // ===== VALUES =====
      for (const meta of dgccPiece.metaFields || []) {
        for (const val of meta.values || []) {
          const createdPieceValue = await PieceValue.create(
            {
              document_id: localDocument.id,
              piece_id: localPiece.id,
              piece_meta_field_id: pieceMetaMap.get(meta.name).id,
              value: val.value,
              row_id: val.row_id,
            },
            { transaction },
          );

          // ===== SYNC PIECE FILE =====
          if (val.file) {
            const fileName = val.file.new_file_name || val.file.filename;

            // Construire le chemin avec le dossier PIECES et META
            const relativeDir = path.join(
              "importation",
              titre,
              libelle,
              typeDocLibelle,
              `DOC-${localDocument.id}`,
              "PIECES",
              pieceLibelle,
              `META-${createdPieceValue.id}`,
            );

            const fileDir = path.join(process.cwd(), relativeDir);
            const filePath = path.join(fileDir, fileName);

            fs.mkdirSync(fileDir, { recursive: true });

            await downloadFile(`${DGCC_URL}/${val.file.fichier}`, filePath);

            await PiecesFichier.create(
              {
                document_id: localDocument.id,
                piece_id: localPiece.id,
                piece_value_id: createdPieceValue.id,
                fichier: path.join(relativeDir, fileName).replace(/\\/g, "/"),
                original_name: val.file.original_name,
                new_file_name: fileName,
                mode: "INDIVIDUEL",
              },
              { transaction },
            );
          }
        }
      }

      /*
      ========================================
      PIECES FICHIERS (NON META)
      ========================================
      */

      for (const file of dgccPiece.documentFichiers || []) {
        const fileName = file.new_file_name || file.filename;

        // Construire le chemin avec le dossier PIECES (sans META)
        const relativeDir = path.join(
          "fichiers",
          titre,
          libelle,
          typeDocLibelle,
          `DOC-${localDocument.id}`,
          "PIECES",
          pieceLibelle,
        );

        const fileDir = path.join(process.cwd(), relativeDir);
        const filePath = path.join(fileDir, fileName);

        fs.mkdirSync(fileDir, { recursive: true });

        await downloadFile(`${DGCC_URL}/${file.fichier}`, filePath);

        await PiecesFichier.create(
          {
            document_id: localDocument.id,
            piece_id: localPiece.id,
            piece_value_id: null,
            fichier: path.join(relativeDir, fileName).replace(/\\/g, "/"),
            original_name: file.original_name,
            new_file_name: fileName,
            mode: file.mode || "INDIVIDUEL",
          },
          { transaction },
        );
      }
    }

    // Commit seulement si c'est notre transaction
    if (shouldCommit) {
      await transaction.commit();
    }

    console.log(`✅ Document ${dgccDoc.id} synchronisé avec succès`);
    return localDocument;
  } catch (error) {
    // Rollback seulement si c'est notre transaction
    if (shouldCommit) {
      await transaction.rollback();
    }
    console.error(`❌ Erreur sync document ${dgccDoc.id}:`, error.message);
    throw error;
  }
};
