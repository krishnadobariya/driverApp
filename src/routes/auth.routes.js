const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    registration,
    addImage,
    login,
    logout,
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
    checkMail,
    followingList,
    followerList,
    removeFollowing,
    removeFollower,
    searchData,
    matchUser,
    topTenUser
} = require("../controllers/auth.controller");

const {
    blockUnblock,
    blockUnblockList,
} = require("../controllers/blockUnblock.controller");

// router.post("/register", upload.array('profile'), registration);
router.post("/register", registration);
router.post("/add-image/:id", upload.array('profile'), addImage)
router.post("/login", login);
router.post("/logout-fcm/:userId", logout);
router.get("/user-profile/:id/:user_id", userProfile);
router.post("/all-user/:id", userList);
router.get("/get-lat-long/:id", getLatLong);
router.get("/get-user-info/:id", getUserInfo);
router.get("/logout/:id", userLogout);
router.put("/update-user/:id", upload.array('profile'), userUpdate);
router.put("/update/vehicle-old/:id", userVehicleUpdateData);
router.put("/update/vehicle-data/:id", updateUserVehicleData);
router.post("/change-password/:id", changePassword);
router.post("/forget-password", forgetPassword);
router.get("/check-mail/:email", checkMail);
router.get("/following/:userId", followingList);
router.get("/follower/:userId", followerList)
router.delete("/remove-following/:userId/:removeUserId", removeFollowing)
router.delete("/remove-follower/:userId/:removeUserId", removeFollower);
router.get("/search/:id", searchData)
router.get("/match-user/:userId", matchUser)
router.get("/ten-user/:id", topTenUser)


/* ----- For Block Unblock Controller ----- */
router.post("/block-user/:user_id/:block_user_id", blockUnblock);
router.get("/block-user-list/:user_id", blockUnblockList)



module.exports = router;