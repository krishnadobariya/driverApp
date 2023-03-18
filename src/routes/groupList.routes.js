const router = require("express").Router();

const {
    joinList,
    remainingList,
    groupListByChat
} = require("../controllers/groupList.controller");

router.get("/join-list/:userId", joinList);
router.get("/remaining-list/:userId", remainingList);
router.get("/chat-group-list/:userId", groupListByChat)

module.exports = router;