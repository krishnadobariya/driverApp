const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    insertBanner,
    getBanner,
    getAllBanner
} = require("../controllers/banner.controller");

router.post("/insert", upload.array('image'), insertBanner);
router.get("/view/:id", getBanner);
router.get("/view-all", getAllBanner)

module.exports = router;