const GroupPost = require('../models/groupPost.model');
const Group = require('../models/group.model');
const User = require('../models/auth.model');
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");

/**
group_id
user_id
user_img (url)
user_name
desc
img/video (file)
 */

exports.addPost = async (req, res) => {
    try {

        let groupId = req.params.groupId;
        let userId = req.params.userId;

        const getGroup = await Group.findOne({ _id: groupId });
        if (getGroup == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const getUser = await User.findOne({ _id: userId });

            if (getUser == null) {

                res.status(status.NOT_FOUND).json(
                    {
                        message: "Data Not Exist",
                        status: false,
                        code: 404,
                        statusCode: 0
                    }
                )

            } else {

                const cloudinaryImageUploadMethod = async file => {
                    return new Promise(resolve => {
                        cloudinary.uploader.upload(file, (err, res) => {
                            if (err) return err
                            resolve({
                                res: res.secure_url
                            })
                        })
                    })
                }

                const urls = [];
                const files = req.files;

                for (const file of files) {
                    const { path } = file;
                    // const newPath = await cloudinaryImageUploadMethod(path);
                    // urls.push(newPath);
                }

                const groupPostData = GroupPost({
                    group_id: groupId,
                    user_id: userId,
                    user_img: getUser.profile.res,
                    user_name: getUser.username,
                    desc: req.body.description,
                    image_video: urls
                });
                const saveData = await groupPostData.save();

                res.status(status.OK).json(
                    {
                        message: "POST ADDED SUCCESSFULLY",
                        status: true,
                        code: 200,
                        statusCode: 1,
                        data: saveData
                    }
                )

            }

        }

    } catch (error) {

        console.log("addPost--Error::", error);
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