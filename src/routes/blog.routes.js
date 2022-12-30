const router = require("express").Router();
const upload = require("../utils/multer.photo");

const {
    addBlog,
    blogList
} = require("../controllers/blog.controller");

router.post("/add/:id", upload.array('thumbnail'), addBlog);
router.post("/list", blogList)


module.exports = router;