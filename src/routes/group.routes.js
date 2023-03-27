const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    insertGroup,
    updateGroup,
    groupPostLike,
    addCommentOnPost,
    commentList,
    groupDetails,
    inviteList,
    addPost,
    notificationList,
    groupChatList,
    deleteGroup
} = require("../controllers/group.controller");

router.post("/add/:user_id", upload.single("group_img"), insertGroup);
router.post("/update/:id", upload.single("group_img"), updateGroup);
router.post("/likeDislike/:user_id/:group_id/:postId", groupPostLike);
router.post("/comment/:userId/:groupId/:postId", addCommentOnPost)
router.get("/commentList/:postId", commentList)
router.get("/details/:groupId/:userId", groupDetails);
router.get("/inviteList/:userId/:groupId", inviteList);
router.post("/post/add/:groupId/:userId", upload.array('posts'), addPost);
router.get("/notificationList/:userId", notificationList);
router.get("/groupChatList/:group_id", groupChatList);
router.delete("/delete/:id", deleteGroup)

module.exports = router;

/*
139.59.88.204:5000/group/add/:user_id
139.59.88.204:5000/group/update/:id"
139.59.88.204:5000/group/likeDislike/:user_id/:group_id/:postId
139.59.88.204:5000/group/comment/:userId/:groupId/:postId
139.59.88.204:5000/group/commentList/:postId
139.59.88.204:5000/group/details/:groupId/:userId
139.59.88.204:5000/group/inviteList/:userId/:groupId
139.59.88.204:5000/group/post/add/:groupId/:userId
139.59.88.204:5000/group/notificationList/:userId
139.59.88.204:5000/group/groupChatList/:group_id
139.59.88.204:5000/group/delete/:id
*/