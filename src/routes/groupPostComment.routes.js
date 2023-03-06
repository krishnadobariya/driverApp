const router = require("express").Router();

const {
    insertGroupPostComment,
    listComment
} = require("../controllers/groupPostComment.controller");

router.post("/add", insertGroupPostComment);
router.post("/list/:post_id", listComment);

module.exports = router;