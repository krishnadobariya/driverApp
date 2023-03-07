const GroupPostComment = require("../models/groupPostComment.model");
const Group = require("../models/group.model");
const GroupPost = require("../models/groupPost.model");
const Auth = require("../models/auth.model");
const status = require("http-status");

exports.insertGroupPostComment = async (req, res) => {
    try {

        const groupData = await Group.findOne({ _id: req.body.group_id });
        if (groupData) {

            const groupPostData = await GroupPost.findOne({ _id: req.body.post_id });
            if (groupPostData) {

                const userData = await Auth.findOne({ _id: req.body.user_id });
                if (userData) {
                    
                    const insertData = await GroupPostComment({
                        post_id: req.body.post_id,
                        group_id: req.body.group_id,
                        user_id: req.body.user_id,
                        user_img: userData.profile[0] ? userData.profile[0].res : "",
                        user_name: userData.username,
                        comment: req.body.comment
                    });
                    const saveData = await insertData.save();

                    res.status(status.CREATED).json(
                        {
                            message: "Group Post Comment Add Successfully",
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

            } else {

                res.status(status.NOT_FOUND).json(
                    {
                        message: "Group Post Not Exist",
                        status: false,
                        code: 404,
                        statusCode: 0,
                        data: []
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

// post wise comment list
exports.listComment = async (req, res) => {
    try {

        const findPostWiseData = await GroupPostComment.find({ post_id: req.params.post_id });
        if (findPostWiseData[0] == undefined) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Post Comment Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0,
                    data: []
                }
            )

        } else {

            res.status(status.OK).json(
                {
                    message: "Group Post Comment List View Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: findPostWiseData
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