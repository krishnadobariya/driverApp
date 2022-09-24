const router = require("express").Router();

const {
    getChatByUserId,
    getAllChatData,
    readChat,
} = require("../controllers/chat.controller");

router.get("/get-chat-by-userid", getChatByUserId);
router.get("/get-all-chat", getAllChatData);
router.post("/read-chat", readChat);

module.exports = router;