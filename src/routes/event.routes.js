const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addEvent
} = require("../controllers/event.controller");

router.post("/add/:id", upload.array('profile'), addEvent);

module.exports = router;