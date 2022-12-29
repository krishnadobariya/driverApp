const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addEvent,
    eventList
} = require("../controllers/event.controller");

router.post("/add/:id", upload.array('profile'), addEvent);
router.get("/list", eventList);

module.exports = router;