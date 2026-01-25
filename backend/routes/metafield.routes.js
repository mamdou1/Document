const router = require("express").Router();
const ctrl = require("../controllers/metaField.controller");

router.get("/:typeId", ctrl.getByType);
router.post("/:typeId", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
