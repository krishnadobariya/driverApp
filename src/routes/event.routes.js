const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addEvent,
    eventList,
    eventDemo
} = require("../controllers/event.controller");

router.post("/add/:id", upload.array('profile'), addEvent);
router.post("/list/:user_id", eventList);
router.post("/demo", eventDemo);

module.exports = router;