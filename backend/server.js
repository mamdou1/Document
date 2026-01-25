const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const sequelize = require("./config/database");
const historiqueLogger = require("./middlewares/historiqueLogger.middleware");

// ✅ ICI (avant authenticate / sync)
require("./models");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(historiqueLogger);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-audit"],
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/exercices", require("./routes/exercice.routes"));
app.use("/api/programmes", require("./routes/programme.routes"));
app.use("/api/chapitres", require("./routes/chapitre.routes"));
app.use("/api/natures", require("./routes/nature.routes"));
app.use("/api/liquidations", require("./routes/liquidation.routes"));
app.use("/api/statistiques", require("./routes/statistiques.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/type", require("./routes/type.routes"));
app.use("/api/pieces", require("./routes/Pieces.routes"));
app.use("/api/fournisseur", require("./routes/fornisseur.routes"));
app.use(
  "/api/serviceBeneficiaire",
  require("./routes/serciveBeneciaire.routes"),
);
//app.use("/api", require("./routes/agentPermission.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));
app.use("/api/droits", require("./routes/droit.routes"));
app.use("/api/droitPermission", require("./routes/droitPermission.routes"));

app.use("/api/services", require("./routes/service.routes"));
app.use("/api/divisions", require("./routes/division.routes"));
app.use("/api/sections", require("./routes/section.routes"));
app.use("/api/fonctions", require("./routes/fonction.routes"));

app.use("/api/historique", require("./routes/historique.routes"));
app.use(
  "/api/sourceDeFinancement",
  require("./routes/sourceDeFinancement.routes"),
);

// Document et generer les champs
app.use("/api/types-documents", require("./routes/typeDocument.routes"));
app.use("/api/meta-fields", require("./routes/metafield.routes"));
app.use("/api/documents", require("./routes/document.routes"));
app.use("/api/uploads", require("./routes/upload.routes"));

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Connexion MySQL + lancement serveur
// 2️⃣ Connexion + sync
sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Connexion MySQL réussie");

    await sequelize.sync(); // ❌ PAS force / alter ici

    // 3️⃣ SEEDER APRÈS sync
    await require("./seeders/001-permissions.seeder")();

    // 4️⃣ Lancer le serveur
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${process.env.PORT}`);
    });
  })
  .catch(console.error);
