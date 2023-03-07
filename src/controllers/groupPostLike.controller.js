const GroupPostLike = require('../models/groupPostLike.model');
const GroupPost = require('../models/groupPost.model');
const Group = require('../models/group.model');
const User = require('../models/auth.model');
const status = require("http-status");

exports.likeDislike = async (req, res) => {
    try {

        let userId = req.body.user_id;
        let postId = req.body.post_id;
        let groupId = req.body.group_id;

        const getGroup = await Group.findOne({ _id: groupId });
        if (getGroup == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Group Not Exist",
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
                        message: "Group Not Exist",
                        status: false,
                        code: 404,
                        statusCode: 0
                    }
                )

            } else {

                const updateLike = await GroupPost.updateOne(
                    {
                        _id: postId,
                        group_id: groupId
                    },
                    {
                        $inc: {
                            like_count: parseInt(req.body.like)
                        }
                    }
                )

                res.status(status.OK).json(
                    {
                        message: "Like/Dislike Updated Successfully",
                        status: true,
                        code: 200,
                        statusCode: 1
                    }
                )

            }

        }

    } catch (error) {

        console.log("likeDislike--Error::", error);
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