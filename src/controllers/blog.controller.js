const { default: mongoose } = require("mongoose");
const authModel = require("../models/auth.model");
const BlogMedel = require("../models/blog.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");
const ObjectId = mongoose.Types.ObjectId



exports.addBlog = async (req, res) => {
    try {

        let userId = req.params.id;

        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, (err, res) => {
                    if (err) return err
                    resolve({
                        res: res.secure_url
                    })
                }
                )
            })
        }

        const urls = []
        const files = req.files;

        for (const file of files) {
            const { path } = file
            console.log("path::", path);

            const newPath = await cloudinaryImageUploadMethod(path)
            urls.push(newPath)
        }

        const blog = BlogMedel(
            {
                user_id: userId,
                thumbnail: urls,
                category: req.body.category,
                heading: req.body.heading,
                description: req.body.description
            })

        const saveData = await blog.save();
        console.log("savedata=====", saveData);

        res.status(status.CREATED).json(
            {
                message: "Blog Add Successfully",
                status: true,
                code: 201,
                statusCode: 1,
                data: saveData
            }
        )

    } catch (error) {
        console.log("Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Something Went Wrong",
                status: false,
                code: 500,
                statusCode: 0,
                error: error.message
            }
        )
    }
}



exports.blogList = async (req, res) => {
    try {

        const alllist = await BlogMedel.find().sort({ createdAt: -1 })

        console.log("alllist=====", alllist)

        res.status(status.OK).json({
            message: "View All List Successfully",
            status: true,
            code: 200,
            statusCode: 1,
            data: alllist
        })

    } catch (error) {
        console.log("Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Something Went Wrong",
                status: false,
                code: 500,
                statusCode: 0,
                error: error.message
            }
        )
    }
}