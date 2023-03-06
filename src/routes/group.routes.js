const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    insertGroup,
    updateGroup
} = require("../controllers/group.controller");

router.post("/add/:user_id", upload.single("group_img"), insertGroup);
router.put("/update/:id", upload.single("group_img"), updateGroup);

module.exports = router;