const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    registration,
    login,
    all_user,
    viewById,
    getLatLong
} = require("../controllers/auth.controller");

router.post("/register", upload.array('profile'), registration);
router.post("/login", login);
router.get("/all-user", all_user);
router.get("/view-by-id/:id", viewById);
router.get("/get-lat-long/:id" , getLatLong);

module.exports = router;