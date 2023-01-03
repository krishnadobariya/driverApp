const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addEvent,
    eventList,
    eventAttendees,
    eventDemo
} = require("../controllers/event.controller");

router.post("/add/:id", upload.array('profile'), addEvent);
router.post("/list/:user_id", eventList);
router.post("/attendees/:id", eventAttendees);
router.post("/demo", eventDemo);

module.exports = router;