const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addBlog,
    blogList,
    blogLikeDislike,
    commentInsert,
    getCommentList,
    likedUser,
    myBlog,
    deleteBlog,
    reportBlog,
    searchBlog,
    updateBlog
} = require("../controllers/blog.controller");

router.post("/add/:id", upload.array('thumbnail'), addBlog);
router.post("/list/:id", blogList);
router.post("/like-dislike/:user_id/:blog_id", blogLikeDislike);
router.post("/comment-add/:user_id/:blog_id", commentInsert);
router.get("/comment-get-list/:blog_id", getCommentList);
router.post("/liked-user/:id", likedUser); // passed blogId
router.post("/my/:user_id", myBlog);
router.post("/delete/:blog_id", deleteBlog);
router.get("/search/:user_id", searchBlog);
router.post("/update/:userId/:blogId", updateBlog);

/* ----- For Report Blog APIs ----- */
router.post("/report-blog/:user_id/:blog_id", reportBlog);

module.exports = router;