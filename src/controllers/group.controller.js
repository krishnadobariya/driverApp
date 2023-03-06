const Group = require("../models/group.model");
const Auth = require("../models/auth.model");
const status = require("http-status");
const cloudinary = require("../utils/cloudinary.utils");

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

            const insertData = await Group({
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

exports.updateGroup = async (req, res) => {
    try {

        const findGroupData = await Group.findOne({ _id: req.params.id });

        if (findGroupData) {

            if (req.file == undefined) {

                const updateData = await Group.findOneAndUpdate({ _id: req.params.id },
                    {
                        $set: {
                            group_name: req.body.group_name,
                            group_desc: req.body.group_desc,
                            group_type: req.body.group_type,
                        }
                    })

                res.status(status.OK).json(
                    {
                        message: "Group Update Successfully",
                        status: true,
                        code: 200,
                        statusCode: 1
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
                        }
                        )
                    })
                }

                const file = req.file;

                const { path } = file

                const newPath = await cloudinaryImageUploadMethod(path)

                const updateData = await Group.findOneAndUpdate({ _id: req.params.id },
                    {
                        $set: {
                            group_img: newPath.res,
                            group_name: req.body.group_name,
                            group_desc: req.body.group_desc,
                            group_type: req.body.group_type
                        }
                    })

                res.status(status.OK).json(
                    {
                        message: "Group Update Successfully",
                        status: true,
                        code: 200,
                        statusCode: 1
                    }
                )



            }

        } else {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Group Not Exist",
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