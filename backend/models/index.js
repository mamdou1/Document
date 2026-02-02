const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const db = {};

// 🔹 Import des modèles
db.Type = require("./type.model")(sequelize, DataTypes);
db.Pieces = require("./Pieces.model")(sequelize, DataTypes);
db.TypePieces = require("./type_pieces.model")(sequelize, DataTypes);

db.Liquidation = require("./Liquidation.model")(sequelize, DataTypes);
db.LiquidationPieces = require("./liquidation_pieces.model")(
  sequelize,
  DataTypes,
);
db.Token = require("./token.model")(sequelize, DataTypes);
db.Programme = require("./Programme.model")(sequelize, DataTypes);
db.Chapitre = require("./Chapitre.model")(sequelize, DataTypes);
db.Nature = require("./Nature.model")(sequelize, DataTypes);
db.Exercice = require("./Exercice.model")(sequelize, DataTypes);
db.Fournisseur = require("./Fournisseur.model")(sequelize, DataTypes);
db.Agent = require("./Agent.model")(sequelize, DataTypes);
db.ServiceBeneficiaire = require("./ServiceBeneficiaire.model")(
  sequelize,
  DataTypes,
);
db.Permission = require("./Permission.model")(sequelize, DataTypes);
db.Droit = require("./Droit.model")(sequelize, DataTypes);
db.PiecesFichier = require("./PieceFichier")(sequelize, DataTypes);

// 🔹 Nouveaux modèles pour la hiérarchie Agent
db.Service = require("./Service.model")(sequelize, DataTypes);
db.Division = require("./Division.model")(sequelize, DataTypes);
db.Section = require("./Section.model")(sequelize, DataTypes);
db.Fonction = require("./Fonction.model")(sequelize, DataTypes);

db.HistoriqueLog = require("./HistoriqueLog.model")(sequelize, DataTypes);
db.SourceDeFinancement = require("./SourceDeFinancement.model")(
  sequelize,
  DataTypes,
);

// =====================
// 🔹 NOUVEAUX MODÈLES DOCUMENTS
// =====================

db.TypeDocument = require("./DocumentType.model")(sequelize, DataTypes);
db.MetaField = require("./MetaField.model")(sequelize, DataTypes);
db.Document = require("./Document.model")(sequelize, DataTypes);
db.DocumentValue = require("./DocumentValue.model")(sequelize, DataTypes);
db.DocumentFile = require("./DocumentFIle.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES Archive
// =====================

db.Salle = require("./Salle.model")(sequelize, DataTypes);
db.Etagere = require("./Etagere.model")(sequelize, DataTypes);
db.Box = require("./Box.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES DOC
// =====================
db.TypeDocumentPieces = require("./DocumentTypePiece.model")(
  sequelize,
  DataTypes,
);
db.DocumentFichier = require("./DocumentFichier.model")(sequelize, DataTypes);
db.DocumentPieces = require("./DocumentPieces.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES Entitee
// =====================
db.EntiteeUn = require("./EntiteeUn.model")(sequelize, DataTypes);
db.EntiteeDeux = require("./EntiteeDeux.model")(sequelize, DataTypes);
db.EntiteeTrois = require("./EntiteeTrois.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES Entitee d'associiation de type de document
// =====================
db.TypeDocumentEntiteUn = require("./TypeDocumentEntite.model")(
  sequelize,
  DataTypes,
);
db.TypeDocumentEntiteDeux = require("./TypeDocumentEntiteDeux.model")(
  sequelize,
  DataTypes,
);
db.TypeDocumentEntiteTrois = require("./TypeDocumentEntiteTrois.model")(
  sequelize,
  DataTypes,
);

// =====================
// 🔹 NOUVEAUX MODÈLES Entitee d'associiation pièce
// =====================
db.PiecesEntiteUn = require("./PiecesEntitee.model")(sequelize, DataTypes);
db.PiecesEntiteDeux = require("./PiecesEntiteeDeux.model")(
  sequelize,
  DataTypes,
);
db.PiecesEntiteTrois = require("./PiecesEntiteeTrois.model")(
  sequelize,
  DataTypes,
);

// 🔹 Appel des associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//console.log("Models chargés:", Object.keys(db));

// 🔹 Exports
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
