const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addUserPost,
    userPostList,
    userPostComment,
    userPostLikeDislike,
    userPostCommnetList,
    userPostLikedList,
} = require("../controllers/userPost.controller");

router.post("/add/:userId", upload.array('posts'), addUserPost);
router.get("/list/:userId", userPostList);
router.post("/addComment/:userId/:postId", userPostComment);
router.post("/likeDislike/:userId/:postId", userPostLikeDislike);
router.post("/commentList/:postId", userPostCommnetList);
router.post("/likedUserList/:postId", userPostLikedList)

module.exports = router;