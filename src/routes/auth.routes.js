const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    registration,
    addImage,
    login,
    userList,
    userProfile,
    getLatLong,
    getUserInfo,
    userLogout,
    userUpdate,
    userVehicleUpdateData,
    updateUserVehicleData,
    changePassword,
    forgetPassword,
} = require("../controllers/auth.controller");

// router.post("/register", upload.array('profile'), registration);
router.post("/register", registration);
router.post("/add-image/:id", upload.array('profile'), addImage)
router.post("/login", login);
router.get("/user-profile/:id/:user_id", userProfile);
router.post("/all-user/:id", userList);
router.get("/get-lat-long/:id", getLatLong);
router.get("/get-user-info/:id", getUserInfo);
router.get("/logout/:id", userLogout);
router.put("/update-user/:id", upload.array('profile'), userUpdate);
router.put("/update/vehicle-/old/:id/:type", userVehicleUpdateData);
router.put("/update/vehicle-data/:id", updateUserVehicleData);
router.post("/change-password/:id", changePassword);
router.post("/forget-password", forgetPassword);

module.exports = router;

