const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addEvent,
    eventList,
    eventAttendees,
    myEvent,
    deleteEvent
} = require("../controllers/event.controller");

router.post("/add/:id", upload.array('profile'), addEvent);
router.post("/list/:user_id", eventList);
router.post("/attendees/:id", eventAttendees);
router.post("/my/:user_id", myEvent);
router.post("/delete/:event_id", deleteEvent);

module.exports = router;