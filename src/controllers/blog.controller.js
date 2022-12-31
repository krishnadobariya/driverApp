const { default: mongoose } = require("mongoose");
const authModel = require("../models/auth.model");
const Blog = require("../models/blog.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");
const blogModel = require("../models/blog.model");
const likeModel = require("../models/like.model");
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

        const findUserData = await authModel.findOne({ _id: userId });

        if (findUserData == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
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
                description: req.body.description
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

        const allBlogData = await Blog.find({ category: vehicleType }).sort({ createdAt: -1 });

        let blogInsertTime = [];
        for (const getTime of allBlogData) {
            console.log("getTime::", getTime);

            var now = new Date();
            var addingDate = new Date(getTime.createdAt);
            var sec_num = (now - addingDate) / 1000;
            var days = Math.floor(sec_num / (3600 * 24));
            var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
            var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
            var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

            console.log("now::-", now);
            console.log("sec_num::-", sec_num);
            console.log("days::-", days);
            console.log("hours::-", hours);
            console.log("minutes::-", minutes);
            console.log("seconds::-", seconds);

            if (hours < 10) { hours = "0" + hours; }
            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }

            if (days > 28) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: new Date(addingDate).toDateString()
                }
                blogInsertTime.push(response);

            } else if (days > 21 && days < 28) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: "4 Week Ago"
                }
                blogInsertTime.push(response);

            } else if (days > 14 && days < 21) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: "3 Week Ago"
                }
                blogInsertTime.push(response);

            } else if (days > 7 && days < 14) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: "2 Week Ago"
                }
                blogInsertTime.push(response);

            } else if (days > 0 && days < 7) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: "1 Week Ago"
                }
                blogInsertTime.push(response);

            } else if (hours > 0 && days == 0) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: `${hours} Hours Ago`
                }
                blogInsertTime.push(response);

            } else if (minutes > 0 && hours == 0) {
                const response = {

                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    time: `${minutes} Minute Ago`
                }
                blogInsertTime.push(response);

            } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {

                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    dateAndTime: `${seconds} Seconds Ago`,
                }
                blogInsertTime.push(response);

            } else if (seconds == 0 && minutes == 0 && hours == 0 && days === 0) {
                const response = {
                    userId: getTime.user_id,
                    username: getTime.username,
                    user_profile: getTime.user_profile,
                    thumbnail: getTime.thumbnail[0] ? getTime.thumbnail[0].res : "",
                    category: getTime.category,
                    heading: getTime.heading,
                    description: getTime.description,
                    dateAndTime: `Just Now`,
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
        })

        const findUser = await authModel.findOne({
            _id: userId
        })

        if (findBlog && findUser) {

            const blogInLikeModel = await likeModel.findOne({
                blogId: blogId
            })

            const reqUserInLikeModel = await likeModel.findOne({
                "reqAuthId._id" : userId
            })


            if (req.query.like == 1) {

                if(blogInLikeModel && reqUserInLikeModel){
                    res.status(status.CONFLICT).json({
                        message: "Already Liked Blog!",
                        status: true,
                        code: 409,
                        statusCode: 1,
                    })
                }else if(blogInLikeModel){

                    await blogModel.updateOne({
                        _id : blogId
                    }, {
                        $inc :{
                            like : 1
                        }
                    })

                    await likeModel.updateOne({
                        blogId : blogId
                    }, {
                        $push: {
                            reqAuthId: {
                                _id :userId 
                            }
                        }
                    })

                    res.status(status.OK).json({
                        message: "Like added!",
                        status: true,
                        code: 200,
                        statusCode: 1,
                    })


                }else{

                    await blogModel.updateOne({
                        _id : blogId
                    }, {
                        $inc :{
                            like : 1
                        }
                    })

                    const insertLike = new likeModel({
                        authId : findBlog?.user_id,
                        blogId: blogId,
                        reqAuthId :{
                            _id : userId
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
                
                if(blogInLikeModel && reqUserInLikeModel){

                    await blogModel.updateOne({
                        _id : blogId
                    }, {
                        $inc :{
                            like : -1
                        }
                    })

                    await likeModel.updateOne({
                        blogId : blogId
                    }, {
                        $pull: {
                            reqAuthId: {
                                _id : userId
                            }
                        }
                    })

                    res.status(status.OK).json({
                        message: "Dislike added!",
                        status: true,
                        code: 409,
                        statusCode: 1,
                    })
                    
                }else{

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