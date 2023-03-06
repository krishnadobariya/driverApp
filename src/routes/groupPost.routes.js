const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addPost,
} = require("../controllers/groupPost.controller");

router.post("/add/:groupId/:userId", upload.array('posts'), addPost);

module.exports = router;