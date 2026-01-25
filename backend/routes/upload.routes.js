const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const ctrl = require("../controllers/upload.controller");

router.post("/:documentId/:fieldId", upload.single("file"), ctrl.uploadFile);

module.exports = router;
