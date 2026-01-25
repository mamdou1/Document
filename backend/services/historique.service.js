const { HistoriqueLog } = require("../models");

class HistoriqueService {
  static async log(payload) {
    try {
      return await HistoriqueLog.create(payload);
    } catch (err) {
      console.error("❌ HistoriqueLog error:", err.message);
    }
  }
}

module.exports = HistoriqueService;
