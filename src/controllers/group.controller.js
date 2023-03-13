const status = require("http-status");
const Auth = require("../models/auth.model");
const Group = require("../models/group.model");
const GroupPost = require("../models/groupPost.model");
const GroupPostLike = require("../models/groupPostLike.model");
const GroupPostComment = require("../models/groupPostComment.model");
const Notification = require("../models/notification.model");
const GroupList = require("../models/groupList.model");
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

exports.groupPostLike = async (req, res) => {
    try {

        let userId = req.params.user_id;
        let groupId = req.params.group_id;
        console.log("userId-groupId::---", userId, groupId);

        const findGroup = await Group.findOne({
            _id: groupId
        });
        console.log("findGroup::---", findGroup);

        const findUser = await Auth.findOne({
            _id: userId
        });
        console.log("findUser::---", findUser);

        if (findGroup && findUser) {

            const groupPostLikeModel = await GroupPostLike.findOne({
                post_id: req.params.postId
            })
            console.log("groupPostLikeModel::---", groupPostLikeModel);

            const reqUserInLikeModel = await GroupPostLike.findOne({
                "reqAuthId._id": userId
            });
            console.log("reqUserInLikeModel::---", groupPostLikeModel);

            console.log("data:body:-", req.body.like);
            if (req.body.like == 1) {

                if (groupPostLikeModel && reqUserInLikeModel) {
                    console.log("LIKED Group Post HERE");

                    res.status(status.CONFLICT).json({
                        message: "Already Liked Group Post!",
                        status: true,
                        code: 409,
                        statusCode: 1,
                    })

                } else if (groupPostLikeModel) {

                    const updateLike = await GroupPost.updateOne({
                        group_id: groupId
                    }, {
                        $inc: {
                            like_count: 1
                        }
                    });
                    console.log("updateLike::", updateLike);


                    const updateLikedUser = await GroupPostLike.updateOne({
                        group_id: groupId
                    }, {
                        $push: {
                            reqAuthId: {
                                _id: userId
                            }
                        }
                    });
                    console.log("updateLikedUser::", updateLikedUser);

                    res.status(status.OK).json({
                        message: "Like added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })


                } else {

                    const insertLike = new GroupPostLike({
                        post_id: req.params.postId,
                        group_id: groupId,
                        user_img: req.body.user_img,
                        user_name: req.body.username,
                        reqAuthId: {
                            _id: userId
                        }
                    });
                    const saveData = await insertLike.save();
                    console.log("saveData::--", saveData);

                    const updateLike = await GroupPost.updateOne({
                        _id: req.params.postId
                    }, {
                        $inc: {
                            like_count: 1
                        }
                    });
                    console.log("updateLike::", updateLike);

                    res.status(status.OK).json({
                        message: "Like added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })

                }

            } else if (req.body.like == 0) {
                console.log('Data::---', req.body.like);


                if (groupPostLikeModel && reqUserInLikeModel) {

                    const updateLike = await GroupPost.updateOne({
                        group_id: groupId
                    }, {
                        $inc: {
                            like_count: -1
                        }
                    });
                    console.log("updateLike::-", updateLike);

                    const updateLikedUser = await GroupPostLike.updateOne({
                        groupId: groupId
                    }, {
                        $pull: {
                            reqAuthId: {
                                _id: userId
                            }
                        }
                    });
                    console.log("updateLikedUser::--", updateLikedUser);

                    const deleteLikedUser = await GroupPostLike.deleteOne({
                        groupId: groupId
                    });
                    console.log("deleteLikedUser::---", deleteLikedUser);

                    res.status(status.OK).json({
                        message: "Dislike added!",
                        status: true,
                        code: 409,
                        statusCode: 1,
                    })

                } else {

                    res.status(status.OK).json({
                        message: "Dislike added!",
                        status: true,
                        code: 409,
                        statusCode: 1,
                    })

                }

            }
        } else {

            res.status(status.NOT_FOUND).json({
                message: "User Or Group Post Not Found!",
                status: true,
                code: 404,
                statusCode: 1,
                data: []
            })

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

exports.addCommentOnPost = async (req, res) => {
    try {

        let userId = req.params.userId;
        let groupId = req.params.groupId;
        let postId = req.params.postId;

        const findPost = await GroupPost.findOne({
            _id: postId
        });

        const findUser = await Auth.findOne({
            _id: userId
        });

        if (findPost && findUser) {

            const blogInCommentModel = await GroupPostComment.findOne({
                post_id: postId,
                group_id: groupId
            });

            if (blogInCommentModel) {

                const updateCommentCount = await GroupPost.updateOne({
                    _id: postId
                }, {
                    $inc: {
                        comment_count: 1
                    }
                })

                const updateComment = await GroupPostComment.updateOne({
                    post_id: postId,
                    group_id: groupId
                }, {
                    $push: {
                        comment: {
                            user_id: userId,
                            user_img: req.body.user_img,
                            user_name: req.body.username,
                            text: req.body.text
                        }

                    }
                })

                res.status(status.OK).json({
                    message: "Comment added!",
                    status: true,
                    code: 200,
                    statusCode: 1,
                })

            } else {

                const updateCommentCount = await GroupPost.updateOne({
                    _id: postId,
                    group_id: groupId
                }, {
                    $inc: {
                        comment_count: 1
                    }
                })

                const insertComment = new GroupPostComment({
                    post_id: postId,
                    group_id: groupId,
                    comment: {
                        user_id: userId,
                        user_img: req.body.user_img,
                        user_name: req.body.username,
                        text: req.body.text
                    }
                })
                const saveData = await insertComment.save()

                res.status(status.OK).json({
                    message: "Comment added!",
                    status: true,
                    code: 200,
                    statusCode: 1,
                })
            }

        } else {
            res.status(status.NOT_FOUND).json({
                message: "User Or Post Not Found!",
                status: true,
                code: 404,
                statusCode: 1,
            })
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

exports.commentList = async (req, res) => {
    try {

        const getCommentedPost = await GroupPostComment.find({ post_id: req.params.postId });
        console.log("getCommentedPost:::", getCommentedPost);

        if (getCommentedPost.length == 0) {

            res.status(status.NOT_FOUND).json({
                message: "THIS POST HAS NO COMMENT",
                status: true,
                code: 404,
                statusCode: 1,
            })

        } else {

            res.status(status.OK).json({
                message: "ALL COMMENTED MESSAGE WITH USER LIST",
                status: true,
                code: 200,
                statusCode: 1,
                DATA: getCommentedPost
            })

        }

    } catch (error) {

        console.log("commentList---Error::", error);
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

exports.groupDetails = async (req, res) => {
    try {

        let userId = req.params.userId;
        let groupId = req.params.groupId;

        const getGroupData = await Group.findOne({ _id: groupId });
        if (getGroupData == null) {

            res.status(status.NOT_FOUND).json({
                message: "Group Not Found!",
                status: true,
                code: 404,
                statusCode: 1,
                data: []
            })

        } else {

            const getGroupPost = await GroupPost.find({
                group_id: groupId
            }).sort({ createdAt: -1 });
            console.log("getGroupPost::---", getGroupPost);

            const respGroup = [];
            for (const resData of getGroupPost) {

                /* To show how long a post has been posted */
                var now = new Date();
                var addingDate = new Date(resData.createdAt);
                var sec_num = (now - addingDate) / 1000;
                var days = Math.floor(sec_num / (3600 * 24));
                var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                if (hours < 10) { hours = "0" + hours; }
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }

                var time;
                if (days > 28) {

                    time = new Date(addingDate).toDateString()

                } else if (days > 21 && days < 28) {

                    time = "3 Week Ago"

                } else if (days > 14 && days < 21) {

                    time = "2 Week Ago"

                } else if (days > 7 && days < 14) {

                    time = "1 Week Ago"

                } else if (days > 0 && days < 7) {

                    time = days == 1 ? `${days} day ago` : `${days} days ago`

                } else if (hours > 0 && days == 0) {

                    time = hours == 1 ? `${hours} hour ago` : `${hours} hours ago`

                } else if (minutes > 0 && hours == 0) {

                    time = minutes == 1 ? `${minutes} minute ago` : `${minutes} minutes ago`

                } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {

                    time = seconds == 1 ? `${seconds} second ago` : `${seconds} seconds ago`

                } else if (seconds == 0 && minutes == 0 && hours == 0 && days === 0) {

                    time = `Just Now`

                }
                /* End Of to show how long a post has been posted */

                console.log("resData::--", resData);
                var findUserWhoLiked = await GroupPostLike.findOne({
                    group_id: groupId,
                    post_id: resData._id,
                    "reqAuthId._id": userId
                });
                console.log("findUserWhoLiked:::", findUserWhoLiked);

                if (findUserWhoLiked == null) {
                    console.log("resData::::----", resData);
                    const response = {
                        _id: resData._id,
                        group_id: resData.group_id,
                        user_id: resData.user_id,
                        user_img: resData.user_img,
                        user_name: resData.user_name,
                        desc: resData.desc,
                        image_video: resData.image_video[0] ? resData.image_video[0].res : "",
                        likes: resData.like_count,
                        commnets: resData.comment_count,
                        media_type: resData.media_type,
                        isLike: false,
                        time: time
                    }
                    respGroup.push(response)

                } else {

                    const response = {
                        _id: resData._id,
                        group_id: resData.group_id,
                        user_id: resData.user_id,
                        user_img: resData.user_img,
                        user_name: resData.user_name,
                        desc: resData.desc,
                        image_video: resData.image_video[0] ? resData.image_video[0].res : "",
                        likes: resData.like_count,
                        commnets: resData.comment_count,
                        isLike: true,
                        time: time
                    }
                    respGroup.push(response)

                }

            }

            const response = {
                groupDetails: getGroupData,
                groupPost: respGroup
            }

            res.status(status.OK).json(
                {
                    message: "Get Group Details Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
                }
            )

        }

    } catch (error) {

        console.log("groupDetails--Error::", error);
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

exports.inviteList = async (req, res) => {
    try {

        const userId = req.params.userId;
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);

        // --- for pagination --- //
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        console.log("startIndex:::", startIndex);

        const getUserDatas = await Auth.find({
            _id: {
                $ne: userId
            }
        }).skip(startIndex).limit(endIndex).sort({ createdAt: -1 });
        console.log("getUserDatas", getUserDatas.length);

        const response = [];
        for (const getUserData of getUserDatas) {
            console.log("getUserData::", getUserData._id);

            const checkNotification = await Notification.findOne({ user_id: getUserData._id });
            console.log("checkNotification:::---", checkNotification);

            if (checkNotification == null) {
                const findUser = await Auth.find({
                    _id: getUserData._id
                }).sort({ createdAt: -1 });
                response.push(findUser);
            }
            console.log("response::---", response.length);
        }

        // const getGroupData = await Group.find({ user_id: userId });

        // const userArr = [];
        // for (const findUserData of getGroupData) {
        //     const getNotificationData = await Notification.findOne({ group_id: findUserData._id })
        //     if (getNotificationData) {
        //         userArr.push(getNotificationData)
        //     }
        // }

        // const userData = []
        // for (const getNotificationUser of userArr) {
        //     const getUserData = await Auth.find({
        //         _id: {
        //             $ne: getNotificationUser.user_id
        //         }
        //     })

        //     userData.push(...getUserData)
        // }

        // var getAllUserWhichIsInNotification = getUserData.filter(function (data) {
        //     return userData.some(function (o2) {
        //         return (data._id).toString() == (o2.id).toString();          // assumes unique id
        //     });
        // })

        // console.log("getAllUserWhichIsInNotification", getAllUserWhichIsInNotification.length);

        res.status(status.OK).json(
            {
                message: "Get User Details Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: response
            }
        )

    } catch (error) {

        console.log("inviteList--Error::", error);
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

exports.addPost = async (req, res) => {
    try {

        let groupId = req.params.groupId;
        let userId = req.params.userId;

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

            const getUser = await Auth.findOne({ _id: userId });

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
                        cloudinary.uploader.upload(file, { resource_type: "auto" }, (err, res) => {
                            if (err) return err
                            resolve({
                                res: res.secure_url
                            })
                        }
                        )
                    })
                }

                const urls = [];
                const files = req.files;

                for (const file of files) {
                    console.log("file::", file);
                    const { path } = file;
                    const newPath = await cloudinaryImageUploadMethod(path);
                    console.log("newPath::---------", newPath);
                    urls.push(newPath);
                }
                console.log("urls:::", urls);
                const groupPostData = GroupPost({
                    group_id: groupId,
                    user_id: userId,
                    user_img: getUser.profile[0] ? getUser.profile[0].res : "",
                    user_name: getUser.username,
                    desc: req.body.description,
                    image_video: urls[0],
                    media_type: req.body.media_type
                });
                const saveData = await groupPostData.save();

                const response = {
                    post_id: saveData._id,
                    group_id: saveData.group_id,
                    user_id: saveData.userId,
                    user_img: saveData.user_img,
                    user_name: saveData.user_name,
                    desc: saveData.desc,
                    image_video: saveData.image_video[0] ? saveData.image_video[0].res : "",
                    like_count: saveData.like_count,
                    comment_count: saveData.comment_count,
                    media_type: saveData.media_type
                }

                res.status(status.OK).json(
                    {
                        message: "POST ADDED SUCCESSFULLY",
                        status: true,
                        code: 200,
                        statusCode: 1,
                        data: response
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

exports.notificationList = async (req, res) => {
    try {

        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);

        // --- for pagination --- //
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const getData = await Notification.find({ user_id: req.params.userId }).skip(startIndex).limit(endIndex);

        if (getData.length == 0) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            res.status(status.OK).json(
                {
                    message: "LIST OF NOTIFICATION FOR USER",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: getData
                }
            )

        }

    } catch (error) {

        console.log("notificationList--Error::", error);
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