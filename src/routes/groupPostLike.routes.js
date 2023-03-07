const router = require("express").Router();

const {
    likeDislike
} = require("../controllers/groupPostLike.controller");

router.post("/likeDislike", likeDislike);

module.exports = router;