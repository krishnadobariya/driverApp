const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    registration,
    login,
    all_user,
    viewById,
    getLatLong,
    getUserInfo,
    userLogout
} = require("../controllers/auth.controller");

router.post("/register", upload.array('profile'), registration);
router.post("/login", login);
router.get("/all-user", all_user);
router.get("/view-by-id/:id", viewById);
router.get("/get-lat-long/:id" , getLatLong);
router.get("/get-user-info" , getUserInfo);
router.get("/logout/:id" , userLogout)

module.exports = router;
