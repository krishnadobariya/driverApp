const router = require("express").Router();

const {
    joinList,
    remainingList,
    groupListByChat,
    groupPostLikedList,
    memberList
} = require("../controllers/groupList.controller");

router.get("/join-list/:userId", joinList);
router.get("/remaining-list/:userId", remainingList);
router.get("/chat-group-list/:userId", groupListByChat);
router.get("/liked-user-list/:postId", groupPostLikedList);
router.get("/member-list/:groupId", memberList)

module.exports = router;