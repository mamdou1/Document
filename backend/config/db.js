const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté avec succès");
  } catch (err) {
    console.error("Error de connexion à MongoDB :", err.message);
    process.exit(1); // Arrête le server en cas d'echec
  }
};
module.exports = connectDB;
