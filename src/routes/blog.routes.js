const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addBlog,
    blogList,
    blogLikeDislike,
    commentInsert,
    getCommentList
} = require("../controllers/blog.controller");

router.post("/add/:id", upload.array('thumbnail'), addBlog);
router.post("/list/:id", blogList);
router.post("/like-dislike/:user_id/:blog_id", blogLikeDislike);
router.post("/comment-add/:user_id/:blog_id" , commentInsert);
router.get("/comment-get-list/:blog_id" , getCommentList)

module.exports = router;