const router = require("express").Router();
const ctrl = require("../controllers/agentAccess.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post("/", verifyToken, authorizePermission("box", "create"), ctrl.grant);
router.get(
  "/:agentId",
  verifyToken,
  authorizePermission("box", "read"),
  ctrl.agentAccesById,
);
router.get("/", verifyToken, authorizePermission("box", "read"), ctrl.list);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("box", "delete"),
  ctrl.revoke,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("box", "update"),
  ctrl.update,
);

module.exports = router;
