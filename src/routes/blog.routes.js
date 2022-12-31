const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addBlog,
    blogList,
    blogLikeDislike
} = require("../controllers/blog.controller");

router.post("/add/:id", upload.array('thumbnail'), addBlog);
router.post("/list", blogList);
router.post("/like-dislike/:user_id/:blog_id", blogLikeDislike)

module.exports = router;