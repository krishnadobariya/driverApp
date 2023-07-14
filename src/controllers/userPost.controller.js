const User = require("../models/auth.model");
const UserPost = require("../models/userPost.model");
const UserPostComment = require("../models/userPostComment.model");
const UserPostLike = require("../models/userPostLike.model");
const FriendRequest = require("../models/frdReq.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");
const { Readable } = require('stream');
const mongoose = require("mongoose");


exports.addUserPost = async (req, res) => {
    try {
        let userId = req.params.userId;

        /* Image Uploading */
        /* const cloudinaryImageUploadMethod = async file => {
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
        } */

        // --------------------------------------------------------------------------------------------

        const cloudinaryImageUploadMethod = async (file) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    file,
                    { resource_type: "auto" },
                    (err, res) => {
                        if (err) reject(err);
                        resolve({
                            res: res.secure_url,
                        });
                    }
                );
            });
        };

        /* const files = req.files;
        
        const uploadPromises = files.map(file => {
          console.log("file::", file);
          const { path } = file;
          return cloudinaryImageUploadMethod(path);
        });

        const uploadedUrls = await Promise.all(uploadPromises); */


        const urls = [];
        const files = req.files;

        await Promise.all(
            files.map(async (file) => {
                const { path } = file;
                const newPath = await cloudinaryImageUploadMethod(path);
                urls.push(newPath);
            })
        );


        /* const urls = [];
        const files = req.files;
        
        await Promise.all(files.map(file => cloudinaryImageUploadMethod(file.path)))
          .then(newPaths => {
            urls.push(...newPaths);
          })
          .catch(err => {
            // Handle error
          }); */


        /* const urls = [];
        const files = req.files;

        await Promise.allSettled(
            files.map(async (file) => {
                const { path } = file;
                const newPath = await cloudinaryImageUploadMethod(path);
                urls.push(newPath);
            })
        ); */

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
        console.log("findUser", findUser);

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
            ).select('requested_user_id').sort({ createdAt: -1 });
            console.log('getAccess::', getAccess);

            // const getAccessReq = await FriendRequest.find(
            //     {
            //         requested_user_id: userId,
            //         status: 2
            //     }
            // ).select('user_id').sort({ createdAt: -1 });
            // console.log("getAccessReq::", getAccessReq);

            const postResp = [];
            const getAccessPost = await UserPost.find({ user_id: userId }).sort({ createdAt: -1 });
            postResp.push(getAccessPost);

            for (const respData of getAccess) {

                const getAccessPost = await UserPost.find({ user_id: respData.requested_user_id }).sort({ createdAt: -1 });
                postResp.push(getAccessPost);

            }

            // for (const respData of getAccessReq) {

            //     const getAccessPost = await UserPost.find({ user_id: respData.user_id }).sort({ createdAt: -1 });
            //     postResp.push(getAccessPost);

            // }

            const data = postResp.flat(1);
            const resData = data.sort((date1, date2) => {
                return date1.createdAt - date2.createdAt
            }).reverse();

            const response = [];
            for (const respData of resData) {

                console.log("respData", respData);
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

                console.log("day", days, hours, minutes, seconds);

                var time;
                if (days > 28) {

                    time = new Date(addingDate).toDateString()

                } else if (days >= 21 && days < 28) {

                    time = "3 Week Ago"

                } else if (days >= 14 && days < 21) {

                    time = "2 Week Ago"

                } else if (days >= 7 && days < 14) {

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
                console.log("time", time);

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

            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            console.log(`Pagination :- ${startIndex}, ${endIndex}`);

            res.status(status.OK).json(
                {
                    message: "USER POST ADDED SUCCESSFULLY",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response.slice(startIndex, endIndex)
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
                    // "reqAuthId._id": userId
                    reqAuthId: {
                        $elemMatch: {
                            _id: mongoose.Types.ObjectId(req.params.id)
                        }
                    }
                });
                console.log("reqUserInLikeModel::---", userPostLikeModel, "userId", userId);
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

                        const findPostData = await UserPost.findOne({ _id: userPostLikeModel.post_id })
                        console.log("----1", findPostData);
                        const updateLike = await UserPost.updateOne({
                            // group_id: groupId
                            _id: findPostData._id
                        }, {
                            $set: {
                                likes: findPostData.likes + 1
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

                        console.log("----2", findPost.likes);
                        const updateLike = await UserPost.updateOne({
                            _id: req.params.postId
                        }, {
                            $set: {
                                likes: findPost.likes + 1
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


                    if (userPostLikeModel == null && reqUserInLikeModel == null) {

                        console.log("---------------------->>>>>>>>>");
                        res.status(status.OK).json({
                            message: "Dislike added!",
                            status: true,
                            code: 409,
                            statusCode: 1,
                        })

                    } else {

                        console.log("----3", findPost.likes);
                        const updateLike = await UserPost.updateOne({
                            _id: postId
                        }, {
                            $set: {
                                likes: findPost.likes - 1
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

            const getCommentedPost = await UserPostComment.findOne({ post_id: postId });

            if (getCommentedPost == null) {

                res.status(status.NOT_FOUND).json({
                    message: "THIS POST HAS NO COMMENT",
                    status: true,
                    code: 404,
                    statusCode: 1,
                })

            } else {

                const getCommentOnPost = [];

                for (const getDataOfCOmmentAbout of getCommentedPost.comment) {

                    const userFound = await User.findOne({
                        _id: getDataOfCOmmentAbout.user_id
                    });
                    console.log("userFound::", userFound);

                    if (userFound == null) {

                        const response = {
                            user_id: getDataOfCOmmentAbout.user_id,
                            email: "deleteduser@gmail.com",
                            commentText: getDataOfCOmmentAbout.text,
                            username: "Deleted User",
                            profile: "https://pic.onlinewebfonts.com/svg/img_529679.png"
                        }
                        getCommentOnPost.push(response)

                    } else {

                        const response = {
                            user_id: getDataOfCOmmentAbout.user_id,
                            email: userFound.email,
                            commentText: getDataOfCOmmentAbout.text,
                            username: userFound?.username,
                            profile: userFound?.profile[0]?.res
                        }
                        getCommentOnPost.push(response)

                    }

                }

                const findAthorProfile = await User.findOne({
                    _id: findPost.user_id
                })

                const finalGetCommentData = {
                    authorId: findPost.user_id,
                    postId: findPost._id,
                    author_name: findAthorProfile?.username,
                    author_profile: findAthorProfile?.profile[0]?.res,
                    commentList: getCommentOnPost
                }

                res.status(status.OK).json({
                    message: "ALL COMMENTED MESSAGE WITH USER LIST",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: finalGetCommentData
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

        const findPost = await UserPost.findOne({ _id: postId });
        if (findPost == null) {

            res.status(status.NOT_FOUND).json({
                message: "POST NOT EXIST",
                status: true,
                code: 404,
                statusCode: 1,
            })

        } else {

            const findUserPostData = await UserPostLike.findOne({
                post_id: postId
            });
            console.log("findUserPostData::", findUserPostData.reqAuthId);

            if (findUserPostData == null) {

                res.status(status.NOT_FOUND).json({
                    message: "THIS POST HAS NO LIKE",
                    status: true,
                    code: 404,
                    statusCode: 1,
                })

            } else {

                const getLikeOnPost = [];

                for (const getDataOfLikeAbout of findUserPostData.reqAuthId) {
                    console.log("getDataOfLikeAbout", getDataOfLikeAbout);

                    const userFound = await User.findOne({
                        _id: getDataOfLikeAbout._id
                    });
                    console.log("userFound::", userFound);

                    if (userFound == null) {

                        const response = {
                            user_id: getDataOfLikeAbout._id,
                            email: "deleteduser@gmail.com",
                            username: "Deleted User",
                            profile: "https://pic.onlinewebfonts.com/svg/img_529679.png"
                        }
                        getLikeOnPost.push(response)

                    } else {

                        const response = {
                            user_id: getDataOfLikeAbout._id,
                            email: userFound.email,
                            username: userFound?.username,
                            profile: userFound?.profile[0]?.res
                        }
                        getLikeOnPost.push(response)

                    }

                }

                const findAthorProfile = await User.findOne({
                    _id: findPost.user_id
                })
                console.log("findAthorProfile", findAthorProfile);

                const finalGetCommentData = {
                    userId: findPost.user_id,
                    postId: findPost._id,
                    user_name: findAthorProfile?.username,
                    user_profile: findAthorProfile?.profile[0]?.res,
                    likeList: getLikeOnPost
                }

                res.status(status.OK).json(
                    {
                        message: "Get Liked User Data List Successfully",
                        status: true,
                        code: 200,
                        statusCode: 1,
                        data: finalGetCommentData
                    }
                )

            }

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

exports.updateUserPost = async (req, res) => {
    try {

        const userId = req.params.userId
        const postId = req.params.postId

        const findPostData = await UserPost.findOne({ user_id: userId, _id: postId })

        if (findPostData == null) {

            res.status(status.NOT_FOUND).json({
                message: "POST NOT EXIST",
                status: true,
                code: 404,
                statusCode: 1,
            })

        } else {

            const updatePostData = await UserPost.findOneAndUpdate(
                {
                    _id: findPostData._id
                },
                {
                    $set: {
                        desc: req.body.desc
                    }
                }
            )

            res.status(status.OK).json(
                {
                    message: "User Post Update Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )

        }

    } catch (error) {

        console.log("updateUserPost--Error::", error);
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

exports.deleteUserPost = async (req, res) => {
    try {

        const userId = req.params.userId
        const postId = req.params.postId

        const findPostData = await UserPost.findOne({ user_id: userId, _id: postId })

        if (findPostData == null) {

            res.status(status.NOT_FOUND).json({
                message: "POST NOT EXIST",
                status: true,
                code: 404,
                statusCode: 1,
            })

        } else {

            const deleteUserPost = await UserPost.deleteOne({ user_id: userId, _id: postId })

            res.status(status.OK).json(
                {
                    message: "User Post Delete Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )

        }
        
    } catch (error) {

        console.log("deleteUserPost--Error::", error);
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