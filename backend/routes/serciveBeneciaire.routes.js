const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  createService,
  getService,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceBeneficiaire.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("serviceBeneficiaire", "create"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  createService,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("serviceBeneficiaire", "read"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  getService,
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("serviceBeneficiaire", "read"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  getServiceById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("serviceBeneficiaire", "update"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  updateService,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("serviceBeneficiaire", "delete"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  deleteService,
);
module.exports = router;
