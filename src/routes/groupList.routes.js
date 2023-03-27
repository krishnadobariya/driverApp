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

/*
139.59.88.204:5000/groupList/join-list/:userId
139.59.88.204:5000/groupList/remaining-list/:userId
139.59.88.204:5000/groupList/chat-group-list/:userId
139.59.88.204:5000/groupList/liked-user-list/:postId
139.59.88.204:5000/groupList/member-list/:groupId
*/