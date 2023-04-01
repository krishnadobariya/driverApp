const User = require("../models/auth.model");
const UserPost = require("../models/userPost.model");
const UserPostComment = require("../models/userPostComment.model");
const UserPostLike = require("../models/userPostLike.model");
const FriendRequest = require("../models/frdReq.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");


exports.addUserPost = async (req, res) => {
    try {
        let userId = req.params.userId;

        /* Image Uploading */
        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, { resource_type: "auto" }, (err, res) => {
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
            console.log("file::", file);
            const { path } = file;
            const newPath = await cloudinaryImageUploadMethod(path);
            console.log("newPath::---------", newPath);
            urls.push(newPath);
        }
        /* End Image Uploading */

        const getUser = await User.findOne({ _id: userId });
        console.log("getUser::--::", getUser);

        if (getUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "USER NOT EXIST",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const addData = UserPost({
                user_id: userId,
                user_img: getUser.profile[0] ? getUser.profile[0].res : "",
                user_name: getUser.username,
                desc: req.body.description,
                image_video: urls[0],
                media_type: req.body.media_type
            });
            const saveData = await addData.save();

            const response = {
                post_id: saveData._id,
                group_id: saveData.group_id,
                user_id: saveData.userId,
                user_img: saveData.user_img,
                user_name: saveData.user_name,
                desc: saveData.desc,
                image_video: saveData.image_video[0] ? saveData.image_video[0].res : "",
                likes: saveData.likes,
                comments: saveData.comments,
                media_type: saveData.media_type
            }

            res.status(status.OK).json(
                {
                    message: "USER POST ADDED SUCCESSFULLY",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
                }
            )

        }

    } catch (error) {

        console.log("addUserPost--Error::", error);
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

exports.userPostList = async (req, res) => {
    try {

        let userId = req.params.userId;
        const findUser = await User.findOne({ _id: userId });

        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "USER NOT EXIST",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const getAccess = await FriendRequest.find(
                {
                    user_id: userId,
                    status: 2
                }
            ).select('requested_user_id');
            console.log('getAccess::', getAccess);

            const getAccessReq = await FriendRequest.find(
                {
                    requested_user_id: userId,
                    status: 2
                }
            ).select('user_id');
            console.log("getAccessReq::", getAccessReq);

            const postResp = [];
            for (const respData of getAccess) {

                const getAccessPost = await UserPost.find({ user_id: respData.requested_user_id });
                postResp.push(getAccessPost);

            }

            for (const respData of getAccessReq) {

                const getAccessPost = await UserPost.find({ user_id: respData.user_id });
                postResp.push(getAccessPost);

            }
            console.log("postResp::", postResp);

            const data = postResp.flat(1);

            const response = [];
            for (const respData of data) {

                /* To show how long a post has been posted */
                var now = new Date();
                var addingDate = new Date(respData.createdAt);
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


                var findLikedUser = await UserPostLike.findOne({
                    post_id: respData._id,
                    "reqAuthId._id": userId
                });

                if (findLikedUser == null) {

                    const data = {
                        postId: respData._id,
                        userId: respData.user_id,
                        user_img: respData.user_img,
                        user_name: respData.user_name,
                        desc: respData.desc,
                        image_video: respData.image_video,
                        likes: respData.likes,
                        comments: respData.comments,
                        media_type: respData.media_type,
                        isLike: false,
                        time: time
                    }
                    response.push(data)

                } else {

                    const data = {
                        postId: respData._id,
                        userId: respData.user_id,
                        user_img: respData.user_img,
                        user_name: respData.user_name,
                        desc: respData.desc,
                        image_video: respData.image_video,
                        likes: respData.likes,
                        comments: respData.comments,
                        media_type: respData.media_type,
                        isLike: true,
                        time: time
                    }
                    response.push(data)

                }



            }

            res.status(status.OK).json(
                {
                    message: "USER POST ADDED SUCCESSFULLY",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
                }
            )

        }

    } catch (error) {

        console.log("postList--Error::", error);
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

exports.userPostComment = async (req, res) => {
    try {

        let userId = req.params.userId;
        let postId = req.params.postId;

        const findUser = await User.findOne({ _id: userId });
        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "USER NOT EXIST",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const findPost = await UserPost.findOne({ _id: postId });
            if (findPost == null) {

                res.status(status.NOT_FOUND).json(
                    {
                        message: "POST NOT EXIST",
                        status: false,
                        code: 404,
                        statusCode: 0
                    }
                )

            } else {

                const getCommentData = await UserPostComment.findOne({ post_id: postId });
                if (getCommentData == null) {

                    const insertComment = UserPostComment({
                        post_id: postId,
                        comment: {
                            user_id: userId,
                            user_img: req.body.user_img,
                            user_name: req.body.username,
                            text: req.body.text
                        }
                    });
                    const saveData = await insertComment.save();

                    const updateCommentCount = await UserPost.updateOne({
                        _id: postId
                    }, {
                        $inc: {
                            comments: 1
                        }
                    });

                    res.status(status.OK).json({
                        message: "Comment added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })

                } else {

                    const updateComment = await UserPostComment.updateOne({
                        post_id: postId
                    }, {
                        $push: {
                            comment: {
                                user_id: userId,
                                user_img: req.body.user_img,
                                user_name: req.body.username,
                                text: req.body.text
                            }
                        }
                    });

                    const updateCommentCount = await UserPost.updateOne({
                        _id: postId
                    }, {
                        $inc: {
                            comments: 1
                        }
                    });

                    res.status(status.OK).json({
                        message: "Comment added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })

                }

            }

        }

    } catch (error) {

        console.log("userPostComment--Error::", error);
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

exports.userPostLikeDislike = async (req, res) => {
    try {

        let userId = req.params.userId;
        let postId = req.params.postId;

        const findUser = await User.findOne({ _id: userId });
        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "USER NOT EXIST",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const findPost = await UserPost.findOne({ _id: postId });
            if (findPost == null) {

                res.status(status.NOT_FOUND).json(
                    {
                        message: "POST NOT EXIST",
                        status: false,
                        code: 404,
                        statusCode: 0
                    }
                )

            } else {

                /* --- --- --- --- */
                const userPostLikeModel = await UserPostLike.findOne({
                    post_id: postId
                })
                console.log("userPostLikeModel::---", userPostLikeModel);

                const reqUserInLikeModel = await UserPostLike.findOne({
                    "reqAuthId._id": userId
                });
                console.log("reqUserInLikeModel::---", userPostLikeModel);
                console.log("data:body:-", req.body.like);

                if (req.body.like == 1) {

                    if (userPostLikeModel && reqUserInLikeModel) {
                        console.log("LIKED Group Post HERE");

                        res.status(status.CONFLICT).json({
                            message: "Already Liked Group Post!",
                            status: true,
                            code: 409,
                            statusCode: 1,
                        })

                    } else if (userPostLikeModel) {

                        const updateLike = await UserPost.updateOne({
                            group_id: groupId
                        }, {
                            $inc: {
                                like_count: 1
                            }
                        });
                        console.log("updateLike::", updateLike);


                        const updateLikedUser = await UserPostLike.updateOne({
                            post_id: postId
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

                        const insertLike = new UserPostLike({
                            post_id: postId,
                            user_img: req.body.user_img,
                            user_name: req.body.username,
                            reqAuthId: {
                                _id: userId
                            }
                        });
                        const saveData = await insertLike.save();
                        console.log("saveData::--", saveData);

                        const updateLike = await UserPost.updateOne({
                            _id: req.params.postId
                        }, {
                            $inc: {
                                likes: 1
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


                    if (userPostLikeModel && reqUserInLikeModel) {

                        const updateLike = await UserPost.updateOne({
                            _id: postId
                        }, {
                            $inc: {
                                likes: -1
                            }
                        });
                        console.log("updateLike::-", updateLike);

                        const updateLikedUser = await UserPostLike.updateOne({
                            post_id: postId
                        }, {
                            $pull: {
                                reqAuthId: {
                                    _id: userId
                                }
                            }
                        });
                        console.log("updateLikedUser::--", updateLikedUser);

                        const deleteLikedUser = await UserPostLike.deleteOne({
                            post_id: postId
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
                /* --- --- --- --- */

            }

        }

    } catch (error) {

        console.log("userPostLikeDislike--Error::", error);
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

exports.userPostCommnetList = async (req, res) => {
    try {

        let postId = req.params.postId;

        const findPost = await UserPost.findOne({ _id: postId });
        if (findPost == null) {

            res.status(status.NOT_FOUND).json({
                message: "POST NOT EXIST",
                status: true,
                code: 404,
                statusCode: 1,
            })

        } else {

            const getCommentedPost = await UserPostComment.find({ post_id: postId });
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
                    data: getCommentedPost
                })

            }

        }

    } catch (error) {

        console.log("userPostCommnetList--Error::", error);
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

exports.userPostLikedList = async (req, res) => {
    try {

        let postId = req.params.postId;

        const findUserPostData = await UserPostLike.find({
            post_id: postId
        });
        console.log("findUserPostData::", findUserPostData[0].reqAuthId);

        if (findUserPostData.length == 0) {

            res.status(status.NOT_FOUND).json({
                message: "Liked user Not Found!",
                status: true,
                code: 200,
                statusCode: 1,
                data: []
            })

        } else {

            const response = [];
            for (const getUserData of findUserPostData[0].reqAuthId) {
                console.log("getUserData::", getUserData._id);
                const findUserDetails = await User.findOne({
                    _id: getUserData._id
                });

                const userData = {
                    user_id: getUserData._id,
                    profile: findUserDetails.profile[0] ? findUserDetails.profile[0].res : "",
                    username: findUserDetails.username,
                    email: findUserDetails.email
                }
                response.push(userData)
            }

            res.status(status.OK).json(
                {
                    message: "Get Liked User Data List Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
                }
            )

        }

    } catch (error) {

        console.log("userPostLikedList--Error::", error);
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
