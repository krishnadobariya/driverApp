const router = require('express').Router();
const upload = require("../utils/multer.photo");

const {
    insert
} = require('../controllers/activity.controller');


router.post('/insert/:user_id', upload.single("map_image"), insert);

module.exports = router;