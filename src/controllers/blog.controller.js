const { default: mongoose } = require("mongoose");
const authModel = require("../models/auth.model");
const Blog = require("../models/blog.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");
const blogModel = require("../models/blog.model");
const likeModel = require("../models/like.model");
const commentModel = require("../models/comment.model");
const { find } = require("../models/auth.model");
const Report = require("../models/reportBlog.model")
const ObjectId = mongoose.Types.ObjectId

///home/kurm/Nodejs/driverApp/src/controllers/blog.controller.js

exports.addBlog = async (req, res) => {
    try {

        let userId = req.params.id;

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

        const urls = []
        const files = req.files;

        for (const file of files) {
            const { path } = file
            console.log("path::", path);

            const newPath = await cloudinaryImageUploadMethod(path)
            urls.push(newPath)
        }

        const findUserData = await authModel.findOne({ _id: userId });

        if (findUserData == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0,
                    data: []
                }
            )

        } else {

            const blog = Blog({
                user_id: findUserData._id,
                username: findUserData.username,
                user_profile: findUserData.profile[0] ? findUserData.profile[0].res : "",
                thumbnail: urls,
                category: req.body.category,
                heading: req.body.heading,
                description: req.body.description,
                media_type: req.body.type
            });
            const saveData = await blog.save();

            res.status(status.CREATED).json(
                {
                    message: "Blog Add Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: saveData
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

exports.blogList = async (req, res) => {
    try {

        let vehicleType = req.body.vehicle_type;
        let userId = req.params.id;

        const allBlogData = await Blog.find({
            user_id: {
                $ne: userId
            },
            category: vehicleType
        }).sort({ createdAt: -1 });

        if (allBlogData.length == 0) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: []
                }
            )

        } else {
            let blogInsertTime = [];
            for (const getTime of allBlogData) {

                const allReportBlog = await Report.find({
                    user_id: userId,
                    blog_id: getTime._id
                });

                var report;
                if (allReportBlog.length == 0) {
                    report = false;
                } else {
                    report = true;
                }

                var now = new Date();
                var addingDate = new Date(getTime.createdAt);
                var sec_num = (now - addingDate) / 1000;
                var days = Math.floor(sec_num / (3600 * 24));
                var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                if (hours < 10) { hours = "0" + hours; }
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }

                var findUserInLikeModel = await likeModel.findOne({
                    blogId: getTime._id,
                    "reqAuthId._id": userId
                })

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

                if (findUserInLikeModel) {
                    const response = {
                        _id: getTime._id,
                        userId: getTime.user_id,
                        username: getTime.username,
                        user_profile: getTime.user_profile,
                        thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                        category: getTime.category,
                        heading: getTime.heading,
                        description: getTime.description,
                        like: getTime.like,
                        comment: getTime.comment,
                        isLike: true,
                        time: time,
                        report: report,
                        mediaType: getTime.media_type
                    }
                    blogInsertTime.push(response);
                } else {
                    const response = {
                        _id: getTime._id,
                        userId: getTime.user_id,
                        username: getTime.username,
                        user_profile: getTime.user_profile,
                        thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                        category: getTime.category,
                        heading: getTime.heading,
                        description: getTime.description,
                        like: getTime.like,
                        comment: getTime.comment,
                        isLike: false,
                        time: time,
                        report: report,
                        mediaType: getTime.media_type
                    }
                    blogInsertTime.push(response);
                }

            }

            res.status(status.OK).json({
                message: "View All List Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: blogInsertTime
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

exports.blogLikeDislike = async (req, res) => {
    try {

        let userId = req.params.user_id;
        let blogId = req.params.blog_id;

        const findBlog = await blogModel.findOne({
            _id: blogId
        });

        const findUser = await authModel.findOne({
            _id: userId
        });

        if (findBlog && findUser) {

            const blogInLikeModel = await likeModel.findOne({
                blogId: blogId
            })

            const reqUserInLikeModel = await likeModel.findOne({
                "reqAuthId._id": userId
            })


            if (req.query.like == 1) {

                if (blogInLikeModel && reqUserInLikeModel) {

                    res.status(status.CONFLICT).json({
                        message: "Already Liked Blog!",
                        status: true,
                        code: 409,
                        statusCode: 1,
                    })

                } else if (blogInLikeModel) {

                    await blogModel.updateOne({
                        _id: blogId
                    }, {
                        $inc: {
                            like: 1
                        }
                    })

                    await likeModel.updateOne({
                        blogId: blogId
                    }, {
                        $push: {
                            reqAuthId: {
                                _id: userId
                            }
                        }
                    })

                    res.status(status.OK).json({
                        message: "Like added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })


                } else {

                    await blogModel.updateOne({
                        _id: blogId
                    }, {
                        $inc: {
                            like: 1
                        }
                    })

                    const insertLike = new likeModel({
                        authId: findBlog?.user_id,
                        blogId: blogId,
                        reqAuthId: {
                            _id: userId
                        }
                    })
                    await insertLike.save()

                    res.status(status.OK).json({
                        message: "Like added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })

                }

            } else if (req.query.like == 0) {

                if (blogInLikeModel && reqUserInLikeModel) {

                    await blogModel.updateOne({
                        _id: blogId
                    }, {
                        $inc: {
                            like: -1
                        }
                    })

                    await likeModel.updateOne({
                        blogId: blogId
                    }, {
                        $pull: {
                            reqAuthId: {
                                _id: userId
                            }
                        }
                    })

                    const deleteLikedUser = await likeModel.deleteOne({
                        blogId: blogId
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
                message: "User Or Blog Not Found!",
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

exports.commentInsert = async (req, res) => {
    try {

        let userId = req.params.user_id;
        let blogId = req.params.blog_id;

        const findBlog = await blogModel.findOne({
            _id: blogId
        })

        const findUser = await authModel.findOne({
            _id: userId
        })
        if (findBlog && findUser) {

            const blogInCommentModel = await commentModel.findOne({
                blog_id: blogId
            })

            if (blogInCommentModel) {

                await blogModel.updateOne({
                    _id: blogId
                }, {
                    $inc: {
                        comment: 1
                    }
                })

                await commentModel.updateOne({
                    blog_id: blogId
                }, {
                    $push: {
                        comment: {
                            user_id: userId,
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
                await blogModel.updateOne({
                    _id: blogId
                }, {
                    $inc: {
                        comment: 1
                    }
                })

                const insertComment = new commentModel({
                    blog_id: blogId,
                    author_id: findBlog?.user_id,
                    comment: {
                        user_id: userId,
                        text: req.body.text
                    }
                })
                await insertComment.save()

                res.status(status.OK).json({
                    message: "Comment added!",
                    status: true,
                    code: 200,
                    statusCode: 1,
                })
            }



        } else {
            res.status(status.NOT_FOUND).json({
                message: "User Or Blog Not Found!",
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

exports.getCommentList = async (req, res) => {
    try {

        const blogId = req.params.blog_id;

        const findBlog = await blogModel.findOne({
            _id: blogId
        })

        if (findBlog) {

            const findBlogInCommentModel = await commentModel.findOne({
                blog_id: blogId
            })

            if (findBlogInCommentModel) {

                const getCommentOnBlog = [];

                for (const getDataOfCOmmentAbout of findBlogInCommentModel.comment) {

                    const userFound = await authModel.findOne({
                        _id: getDataOfCOmmentAbout.user_id
                    });
                    console.log("userFound::", userFound);
                    const response = {
                        user_id: getDataOfCOmmentAbout.user_id,
                        email: userFound.email,
                        commentText: getDataOfCOmmentAbout.text,
                        username: userFound?.username,
                        profile: userFound?.profile[0]?.res
                    }
                    getCommentOnBlog.push(response)

                }

                const findAthorProfile = await authModel.findOne({
                    _id: findBlogInCommentModel.author_id
                })

                const finalGetCommentData = {
                    authorId: findBlogInCommentModel.author_id,
                    blogId: findBlogInCommentModel.blog_id,
                    author_name: findAthorProfile?.username,
                    author_profile: findAthorProfile?.profile[0]?.res,
                    commentList: getCommentOnBlog
                }

                res.status(status.OK).json(
                    {
                        message: "Get Comment List Successfully",
                        status: true,
                        code: 200,
                        statusCode: 1,
                        data: finalGetCommentData
                    }
                )


            } else {
                res.status(status.NOT_FOUND).json(
                    {
                        message: "Not Found Any Comment on this Blog!",
                        status: true,
                        code: 404,
                        statusCode: 1,
                        data: []
                    }
                )

            }

        } else {

            res.status(status.NOT_FOUND).json({
                message: "Blog Not Found!",
                status: true,
                code: 200,
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

exports.likedUser = async (req, res) => {
    try {

        let blogId = req.params.id;

        const findBlogData = await likeModel.find({
            blogId: blogId
        });
        console.log("findBlogData::", findBlogData[0].reqAuthId);

        if (findBlogData.length == 0) {

            res.status(status.NOT_FOUND).json({
                message: "Liked user Not Found!",
                status: true,
                code: 200,
                statusCode: 1,
                data: []
            })

        } else {

            const response = [];
            for (const getUSerData of findBlogData[0].reqAuthId) {
                console.log("getUSerData::", getUSerData._id);
                const findUserDetails = await authModel.findOne({
                    _id: getUSerData._id
                })

                const userData = {
                    user_id: getUSerData._id,
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

exports.myBlog = async (req, res) => {
    try {

        let userId = req.params.user_id;
        let category = req.body.category;

        const getBlogData = await Blog.find({
            user_id: userId,
            category: category
        });
        console.log("getBlogData::", getBlogData);

        if (getBlogData.length == 0) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: []
                }
            )

        } else {


            const response = [];
            const blogInsertTime = [];
            for (const respSet of getBlogData) {

                var now = new Date();
                var addingDate = new Date(respSet.createdAt);
                var sec_num = (now - addingDate) / 1000;
                var days = Math.floor(sec_num / (3600 * 24));
                var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                if (hours < 10) { hours = "0" + hours; }
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }

                var findUserInLikeModel = await likeModel.findOne({
                    blogId: respSet._id,
                    "reqAuthId._id": userId
                })

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

                if (findUserInLikeModel) {
                    const response = {
                        _id: respSet._id,
                        userId: respSet.user_id,
                        username: respSet.username,
                        user_profile: respSet.user_profile,
                        thumbnail: respSet.thumbnail[0] ? respSet.thumbnail[0].res : "",
                        category: respSet.category,
                        heading: respSet.heading,
                        description: respSet.description,
                        like: respSet.like,
                        comment: respSet.comment,
                        isLike: true,
                        time: time
                    }
                    blogInsertTime.push(response);
                } else {
                    const response = {
                        _id: respSet._id,
                        userId: respSet.user_id,
                        username: respSet.username,
                        user_profile: respSet.user_profile,
                        thumbnail: respSet.thumbnail[0] ? respSet.thumbnail[0].res : "",
                        category: respSet.category,
                        heading: respSet.heading,
                        description: respSet.description,
                        like: respSet.like,
                        comment: respSet.comment,
                        isLike: false,
                        time: time
                    }
                    blogInsertTime.push(response);
                }

            }

            res.status(status.OK).json(
                {
                    message: "GET MY ALL BLOG LIST SUCCESSFULLY",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: blogInsertTime
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

exports.deleteBlog = async (req, res) => {
    try {

        const blogId = req.params.blog_id;

        const deleteBlogData = await Blog.deleteOne({
            _id: blogId
        });

        res.status(status.OK).json(
            {
                message: "Blog Delete Successfully",
                status: true,
                code: 200,
                statusCode: 1,
            }
        )

    } catch (error) {

        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Somthing Went Wrong",
                status: false,
                code: 501,
                statusCode: 0
            }
        )

    }
}


/* ----- for report blog apis ----- */
exports.reportBlog = async (req, res) => {
    try {

        const user_id = req.params.user_id;
        const blog_id = req.params.blog_id;

        const findUserData = await authModel.findOne({ _id: user_id });
        const findBlogData = await Blog.findOne({ _id: blog_id })

        if (findUserData == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0,
                    data: []
                }
            )

        } else {

            if (findBlogData == null) {

                res.status(status.NOT_FOUND).json(
                    {
                        message: "Blog Data Not Exist",
                        status: false,
                        code: 404,
                        statusCode: 0,
                        data: []
                    }
                )

            } else {

                const findReportUserData = await Report.findOne({ user_id: user_id, blog_id: blog_id });

                if (findReportUserData == null) {

                    const addInReport = Report({
                        user_id: user_id,
                        blog_id: blog_id,
                        message: req.body.message
                    });
                    const saveData = await addInReport.save();

                    res.status(status.CREATED).json(
                        {
                            message: "Blog Report Add Successfully",
                            status: true,
                            code: 201,
                            statusCode: 1,
                            data: saveData
                        }
                    )

                } else {

                    res.status(status.CONFLICT).json(
                        {
                            message: "User Already Report This Blog",
                            status: false,
                            code: 409,
                            statusCode: 0,
                            data: []
                        }
                    )

                }

            }

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