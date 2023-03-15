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
} = require("../controllers/group.controller");

router.post("/add/:user_id", upload.single("group_img"), insertGroup);
router.post("/update/:id", upload.single("group_img"), updateGroup);
router.post("/likeDislike/:user_id/:group_id/:postId", groupPostLike);
router.post("/comment/:userId/:groupId/:postId", addCommentOnPost)
router.get("/commentList/:postId", commentList)
router.get("/details/:groupId/:userId", groupDetails);
router.get("/inviteList/:userId", inviteList);
router.post("/post/add/:groupId/:userId", upload.array('posts'), addPost);
router.get("/notificationList/:userId", notificationList);
router.get("/groupChatList/:group_id", groupChatList)

module.exports = router;