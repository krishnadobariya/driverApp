const groupPostComment = require("../models/groupPostComment.model");
const status = require("http-status");

exports.insertGroup = async (req, res) => {
    try {
        const userData = await Auth.findOne({ _id: req.params.user_id })

        if (userData) {

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

            const file = req.file;

            const { path } = file

            const newPath = await cloudinaryImageUploadMethod(path)

            const insertData = await groupPostComment({
                user_id: req.params.user_id,
                group_img: newPath.res,
                group_name: req.body.group_name,
                group_desc: req.body.group_desc,
                group_type: req.body.group_type
            })
            const saveData = await insertData.save();

            res.status(status.CREATED).json(
                {
                    message: "Group Add Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: saveData
                }
            )

        } else {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0,
                    data: []
                }
            )

        }

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