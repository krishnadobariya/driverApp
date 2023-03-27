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

/**
139.59.88.204:5000/userPost/add/:userId
139.59.88.204:5000/userPost/list/:userId
139.59.88.204:5000/userPost/addComment/:userId/:postId
139.59.88.204:5000/userPost/likeDislike/:userId/:postId
139.59.88.204:5000/userPost/commentList/:postId
139.59.88.204:5000/userPost/likedUserList/:postId
*/