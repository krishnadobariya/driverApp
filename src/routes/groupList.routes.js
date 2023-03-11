const router = require("express").Router();

const {
    joinList,
    remainingList
} = require("../controllers/groupList.controller");

router.get("/join-list/:userId", joinList);
router.get("/remaining-list/:userId", remainingList);

module.exports = router;