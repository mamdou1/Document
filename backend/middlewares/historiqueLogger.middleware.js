// const HistoriqueService = require("../services/historique.service");

// const mapAction = (method) => {
//   switch (method) {
//     case "POST":
//       return "create";
//     case "GET":
//       return "read";
//     case "PUT":
//     case "PATCH":
//       return "update";
//     case "DELETE":
//       return "delete";
//     default:
//       return "other";
//   }
// };

// module.exports = (req, res, next) => {
//   const start = Date.now();

//   res.on("finish", async () => {
//     try {
//       if (res.statusCode >= 400) return;

//       if (req.originalUrl.includes("/auth")) return;

//       const user = req.user || null;

//       await HistoriqueService.log({
//         agent_id: user?.id || null,
//         action: mapAction(req.method),
//         resource: req.baseUrl.split("/")[2] || "system",
//         resource_id: req.params?.id || null,
//         method: req.method,
//         path: req.originalUrl,
//         status: res.statusCode,
//         ip: req.ip,
//         user_agent: req.headers["user-agent"],
//         data: {
//           duration: Date.now() - start,
//         },
//       });
//     } catch (e) {
//       console.error("❌ Historique middleware error:", e.message);
//     }
//   });

//   next();
// };
const HistoriqueService = require("../services/historique.service");

const mapAction = (method) => {
  switch (method) {
    case "POST":
      return "create";
    case "GET":
      return "read";
    case "PUT":
      return "update";
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "other";
  }
};

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      if (res.statusCode >= 400) return;
      if (req.originalUrl.includes("/auth")) return;

      const user = req.user || null;
      const action = mapAction(req.method);

      if (action === "other") return;

      // ✅ Ignore les GET sauf s'ils sont marqués audit
      if (action === "read" && !req.headers["x-audit"]) return;

      await HistoriqueService.log({
        agent_id: user?.id || null,
        action,
        resource: req.baseUrl.split("/")[2] || "system",
        resource_id: req.params?.id || null,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          duration: Date.now() - start,
        },
      });
    } catch (e) {
      console.error("❌ Historique middleware error:", e.message);
    }
  });

  next();
};
