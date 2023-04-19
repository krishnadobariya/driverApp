const mongoose = require("mongoose");
const authModel = require("../models/auth.model");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const chatModel = require("../webSocket/models/chat.model");
const Group = require("../models/group.model");
const GroupList = require("../models/groupList.model");
const GroupMember = require("../models/groupMemberList.model");
const Notification = require("../models/notification.model");
const GroupPost = require("../models/groupPost.model");
const GroupPostLike = require("../models/groupPostLike.model");
const GroupPostComm = require("../models/groupPostComment.model");
const GroupChatRoom = require("../webSocket/models/groupChatRoom.model");
const GroupChat = require("../webSocket/models/groupChat.model");
const Activity = require('../models/activity.model');
const Block = require("../models/blockUnblock.model");
const Blog = require("../models/blog.model");
const BlogComment = require("../models/comment.model");
const BlogLike = require("../models/like.model");
const ReportBlog = require("../models/reportBlog.model");
const Question = require("../models/userQuestion.model");
const FriendRequest = require("../models/frdReq.model");
const UserPost = require("../models/userPost.model");
const UserPostComment = require("../models/userPostComment.model");
const UserPostLike = require("../models/userPostLike.model");
const activity = require("../models/activity.model");
const Event = require("../models/event.model");
const JoinEvent = require("../models/joinEvent.model");
const cloudinary = require("../utils/cloudinary.utils");
const { mailService } = require("../services/email.service");
const status = require("http-status");


exports.registration = async (req, res) => {
    try {

        let email = req.body.email;

        // const cloudinaryImageUploadMethod = async file => {
        //     return new Promise(resolve => {
        //         cloudinary.uploader.upload(file, (err, res) => {
        //             if (err) return err
        //             resolve({
        //                 res: res.secure_url
        //             })
        //         }
        //         )
        //     })
        // }

        // const urls = []
        // const files = req.files;

        // for (const file of files) {
        //     const { path } = file
        //     console.log("path::", path);

        //     const newPath = await cloudinaryImageUploadMethod(path)
        //     urls.push(newPath)
        // }

        const getData = await authModel.find({ email: email });


        if (getData.length == 0) {

            // --- User's Basic Details Inserting Here --- //
            const authData = authModel({
                profile: [{
                    res: "https://res.cloudinary.com/tcloud/image/upload/v1673262748/lcnbz5ch2domvf40jmta.png"
                }],
                username: req.body.username,
                email: req.body.email,
                country_code: req.body.country_code,
                phone_number: req.body.phone_number,
                age: req.body.age,
                gender: req.body.gender,
                password: req.body.password,
                fcm_token: req.body.fcm_token,
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(req.body.longitude),
                        parseFloat(req.body.latitude),
                    ],
                },
                user_type: req.body.user_type,
                vehicle: req.body.vehicle
            });
            const saveData = await authData.save();
            console.log("saveData:::", saveData);

            const insertAns = Question({
                user_id: saveData._id,
                que_one: req.body.que_one,
                que_two: req.body.que_two,
                que_three: req.body.que_three,
                que_four: req.body.que_four,
            });
            const saveQue = await insertAns.save();

            const response = {
                user_id: saveData._id,
                profile: saveData.profile[0].res,
                username: saveData.username,
                email: saveData.email,
                country_code: saveData.country_code,
                phone_number: saveData.phone_number,
                age: saveData.age,
                gender: saveData.gender,
                password: saveData.password,
                fcm_token: saveData.fcm_token,
                longitude: saveData.location.coordinates[0],
                latitude: saveData.location.coordinates[1],
                user_type: saveData.user_type,
                status: saveData.status,
                vehicle: saveData.vehicle
            }

            res.status(status.CREATED).json(
                {
                    message: "User Register Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: response
                }
            )
        } else {
            res.status(status.CONFLICT).json(
                {
                    message: "Email Already Exist",
                    status: false,
                    code: 409,
                    statusCode: 0
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

exports.login = async (req, res) => {
    try {

        let email = req.body.email;
        let password = req.body.password;

        const getAuthData = await authModel.find({ email: email });
        if (getAuthData.length == 0) {
            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )
        } else {
            if (getAuthData[0].password == password) {

                await authModel.updateOne({
                    email: email
                }, {
                    $set: {
                        fcm_token: req.body.fcm_token
                    }
                })
                const getData = await authModel.find({ email: email });

                const response = {
                    user_id: getData[0]._id,
                    profile: getData[0].profile[0].res,
                    username: getData[0].username,
                    email: getData[0].email,
                    country_code: getData[0].country_code,
                    phone_number: getData[0].phone_number,
                    age: getData[0].age,
                    gender: getData[0].gender,
                    user_type: getData[0].user_type,
                    password: getData[0].password,
                    fcm_token: getData[0].fcm_token,
                    longitude: getData[0].location.coordinates[0],
                    latitude: getData[0].location.coordinates[1],
                    vehicle: getData[0].vehicle
                }

                res.status(status.OK).json(
                    {
                        message: "User Login Successfully",
                        status: true,
                        code: 200,
                        statusCode: 1,
                        data: response
                    }
                )
            } else {
                res.status(status.UNAUTHORIZED).json(
                    {
                        message: "Password Not Match",
                        status: false,
                        code: 401,
                        statusCode: 0
                    }
                )
            }
        }

    } catch (error) {
        console.log("Error:", error);
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

exports.logout = async (req, res) => {
    try {

        let userId = req.params.userId;

        const getUserData = await authModel.findOne({ _id: userId });

        if (getUserData == null) {
            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )
        } else {

            const userLogout = await authModel.updateOne(
                {
                    _id: userId
                },
                {
                    $set: {
                        fcm_token: null
                    }
                }
            )

            res.status(status.OK).json(
                {
                    message: "User Logout Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )

        }

    } catch (error) {
        console.log("Error:", error);
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

exports.userList = async (req, res) => {
    try {

        let userId = req.params.id;
        let vehicleType = req.body.vehicle_type;
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);

        // --- for pagination --- //
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // --- get user whithout user that id pass --- //
        const blockUserId = [];
        const getUser = await authModel.find({
            _id: {
                $ne: userId
            }
        }).skip(startIndex).limit(endIndex).select('-__v').sort({ createdAt: -1 });
        console.log("getUser::", getUser.length);

        if (getUser.length == 0) {

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

            const vehicleDetails = [];
            for (const userDetails of getUser) {

                const findBlockUser = await Block.find({
                    user_id: userId,
                    block_user_id: userDetails._id
                });

                // for (const getOneData of findBlockUser) {

                //     blockUserId.push((getOneData.block_user_id).toString())

                // }

                // if (blockUserId.includes((userDetails._id).toString())) {

                if (findBlockUser.length != 0) {

                } else {

                    var finalChatId = "";
                    finalChatId = await chatRoomModel.find(
                        {
                            user1: userDetails._id,
                            user2: userId,
                        }
                    );

                    if (finalChatId.length == 0) {
                        finalChatId = await chatRoomModel.find(
                            {
                                user2: userDetails._id,
                                user1: userId,
                            }
                        );

                    }

                    console.log("finalChatId::::", finalChatId);

                    const arrVehicleData = [];
                    var isVehicleData = false;
                    for (const vehicleData of userDetails.vehicle) {

                        if (vehicleData.vehicle_type == vehicleType) {
                            isVehicleData = true;
                            const response = {
                                vehicleImageId: vehicleData.vehicle_img_id,
                                model: vehicleData.model,
                                type: vehicleData.vehicle_type,
                                year: vehicleData.year,
                                trim: vehicleData.trim,
                                dailyDriving: vehicleData.daily_driving,
                                unit: vehicleData.unit
                            }
                            arrVehicleData.push(response);
                        }
                    }
                    if (isVehicleData) {
                        const response = {
                            user_id: userDetails._id,
                            profile: userDetails.profile[0] ? userDetails.profile[0].res : "",
                            userName: userDetails.username,
                            email: userDetails.email,
                            phone: `${userDetails.country_code}${userDetails.phone_number}`,
                            chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                            vehicles: arrVehicleData
                        }
                        vehicleDetails.push(response)
                    }

                    // vehicleDetails.push(userDetails)
                }

            }

            // console.log("i am here" , vehicleDetails);

            res.status(status.OK).json(
                {
                    message: "Get User Detail Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: vehicleDetails
                }
            )

        }
    } catch (error) {

        console.log("userList-Error:", error);
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

exports.userProfile = async (req, res) => {
    try {
        const getUserData = await authModel.findOne(
            {
                _id: req.params.id
            }
        );
        // console.log("userProfile:::", getUserData);

        if (getUserData == null) {

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

            // var getChatRoom = "";
            // getChatRoom = await chatRoomModel.find({
            //     user1: profile_id,
            //     user2: user_id
            // });

            // getChatRoom = await chatRoomModel.find({ 
            //     user1: user_id,
            //     user2: profile_id
            // });

            const profile_id = getUserData._id;
            const user_id = req.params.user_id;

            var getChatRoom = "";
            getChatRoom = await chatRoomModel.find({
                user1: profile_id,
                user2: user_id,
            });

            if (getChatRoom.length == 0) {
                getChatRoom = await chatRoomModel.find({
                    user1: user_id,
                    user2: profile_id,
                });
            } else {
            }
            // console.log("getChatRoom", getChatRoom);

            const getAnswer = await Question.findOne({ user_id: req.params.id }).select({ 'que_one': 1, 'que_two': 1, 'que_three': 1, 'que_four': 1, '_id': 0 });

            const getGroupData = await GroupList.find({ user_id: req.params.id });
            // console.log("getGroupData::--", getGroupData);

            const getFriendRequest = await FriendRequest.findOne({
                user_id: req.params.user_id,
                requested_user_id: req.params.id,
            });
            // console.log("getFriendRequest::", getFriendRequest);

            // 1 - by default
            // 2 - request sent
            // 3 - request accepted

            var request;
            if (getFriendRequest == null) {
                request = 1
            } else {
                if (getFriendRequest.status == 1) {
                    request = 2
                } else {
                    request = 3
                }
            }

            const getActivity = await activity.find({ user_id: profile_id });
            // console.log("getActivity::", getActivity);

            const getUserPost = await UserPost.find({ user_id: req.params.id }).sort();
            // console.log("getUserPost::", getUserPost);

            const resPost = [];
            if (getUserPost.length == 0) {
            } else {
                for (const respPost of getUserPost) {
                    console.log('respPost:::', respPost);

                    /* To show how long a post has been posted */
                    var now = new Date();
                    var addingDate = new Date(respPost.createdAt);
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
                        post_id: respPost._id,
                        "reqAuthId._id": req.params.id
                    });

                    if (findLikedUser == null) {

                        const data = {
                            postId: respPost._id,
                            userId: respPost.user_id,
                            user_img: respPost.user_img,
                            user_name: respPost.user_name,
                            desc: respPost.desc,
                            image_video: respPost.image_video,
                            likes: respPost.likes,
                            comments: respPost.comments,
                            media_type: respPost.media_type,
                            isLike: false,
                            time: time
                        }
                        resPost.push(data);

                    } else {

                        const data = {
                            postId: respPost._id,
                            userId: respPost.user_id,
                            user_img: respPost.user_img,
                            user_name: respPost.user_name,
                            desc: respPost.desc,
                            image_video: respPost.image_video,
                            likes: respPost.likes,
                            comments: respPost.comments,
                            media_type: respPost.media_type,
                            isLike: true,
                            time: time
                        }
                        resPost.push(data)

                    }

                }

            }

            /* Count User Post, Follower, Following */
            const postCount = await UserPost.find({ user_id: getUserData._id }).count();
            console.log('postCount::', postCount);

            const countFollower = await FriendRequest.find({
                $or: [{
                    user_id: getUserData._id
                }, {
                    requested_user_id: getUserData._id
                }],
                status: 2
            }).count();

            const countFollowerReq = await FriendRequest.find({
                requested_user_id: getUserData._id,
                status: 1
            }).count();

            const followerCount = countFollower + countFollowerReq;
            console.log("followerCount::", followerCount);

            const followingCount = await FriendRequest.find({
                user_id: getUserData._id,
                status: 1
            }).count();
            console.log("followingCount::", followingCount);

            const count = {
                post: postCount,
                follower: followerCount,
                following: followingCount
            }

            const resp = {
                user_id: getUserData._id,
                chatRoomId: getChatRoom[0] ? getChatRoom[0]._id : "",
                profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
                username: getUserData.username,
                email: getUserData.email,
                country_code: getUserData.country_code,
                phone_number: getUserData.phone_number,
                age: getUserData.age,
                gender: getUserData.gender,
                user_type: getUserData.user_type,
                password: getUserData.password,
                fcm_token: getUserData.fcm_token,
                longitude: getUserData.location.coordinates[0],
                latitude: getUserData.location.coordinates[1],
                requested: request,
                questions: getAnswer,
                vehicle: getUserData.vehicle
            }

            // console.log("resPost::", resPost);
            const response = {
                countData: count,
                userData: resp,
                groupData: getGroupData,
                activity: getActivity,
                userPost: resPost
            }

            res.status(status.OK).json(
                {
                    message: "Get User Profile Data",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
                }
            )

        }

    } catch (error) {
        console.log("Error:", error);
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

exports.getLatLong = async (req, res) => {
    const findUser = await authModel.findOne({
        _id: req.params.id
    })

    if (findUser) {

        const data = {
            userId: findUser._id,
            userProfile: findUser.profile[0] ? findUser.profile[0].res : "",
            latitude: findUser.location.coordinates[1],
            longitude: findUser.location.coordinates[0]
        }
        res.status(status.OK).json(
            {
                message: "get Lat long!",
                status: true,
                code: 200,
                statusCode: 1,
                data: data
            }
        )


    } else {
        res.status(status.NOT_FOUND).json(
            {
                message: "User Not Found",
                status: false,
                code: 404,
                statusCode: 0
            }
        )
    }
}

exports.getUserInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        // const getAllData = await authModel.find().skip(startIndex).limit(endIndex).select('-__v');
        const getAllData = await authModel.find({
            _id: {
                $ne: req.params.id
            },
            status: "Active"
        }).skip(startIndex).limit(endIndex).select('-__v').sort({ createdAt: -1 });
        const userInfoList = [];
        for (const userInfo of getAllData) {

            const findBlockUser = await Block.find({
                user_id: req.params.id,
                block_user_id: userInfo._id
            })

            if (findBlockUser.length != 0) {

            } else {

                const response = {
                    _id: userInfo._id,
                    profile: userInfo.profile,
                    username: userInfo.username,
                    latitude: userInfo.location.coordinates[1],
                    longitude: userInfo.location.coordinates[0],
                }
                userInfoList.push(response)

            }

        }
        res.status(status.OK).json(
            {
                message: "User Login Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: userInfoList
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

exports.userLogout = async (req, res, next) => {
    try {

        /* Find User Data */
        const findUser = await authModel.findOne({
            _id: req.params.id
        });

        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Found",
                    status: true,
                    code: 404,
                    statusCode: 1
                }
            )

        } else {


            /* Delete User By Id */
            await authModel.deleteOne({
                _id: req.params.id
            });


            /* - - - - - - - Start Event Portion - - - - - - - */

            /* Find Event Data By UserId */
            const getEvent = await Event.find({ user_id: req.params.id });
            for (const respData of getEvent) {

                /* Delete Event Data By EventId */
                const delEvent = await Event.deleteOne({
                    _id: respData._id
                });

                /* Delete Join Event Data By EventId */
                const delJoinEvent = await JoinEvent.deleteOne({
                    event_id: respData._id
                })
            }

            /* Delete Joining Event By UserId*/
            const delJoinEvent = await JoinEvent.deleteMany({
                user_id: req.params.id
            });

            /* - - - - - - - End Event Portion - - - - - - - */


            /* - - - - - - - Start Blog Portion - - - - - - - */

            const findBlog = await Blog.find({ user_id: req.params.id });
            console.log("findBlog::", findBlog);

            if (findBlog.length == 0) {
            } else {

                for (const respData of findBlog) {
                    console.log("respData::", respData._id);

                    const delBlog = await Blog.deleteOne({ _id: respData._id });
                    const delBlogLike = await BlogLike.deleteOne({ blogId: respData._id });
                    const delBlogComment = await BlogComment.deleteOne({ blog_id: respData._id });
                    const delReportBlog = await ReportBlog.deleteMany({ blog_id: respData._id });

                }

                const findBlogComm = await BlogComment.find({
                    comment: {
                        $elemMatch: {
                            user_id: mongoose.Types.ObjectId(req.params.id)
                        }
                    }
                });
                console.log("findBlog::::", findBlogComm);

                /* Find Blog Data By Liked Collection Using UserId */
                const findBlogData = await BlogLike.find({
                    reqAuthId: {
                        $elemMatch: {
                            _id: req.params.id
                        }
                    }
                }).select('blogId');

                for (const getBlogId of findBlogData) {
                    console.log('getBlogId::', getBlogId);

                    await Blog.updateOne(
                        {
                            _id: getBlogId.blogId
                        },
                        {
                            $inc: {
                                like: -1
                            }
                        }
                    );

                }

                /* Delete User Like Data From BLog Like Collection */
                await BlogLike.updateMany({
                    reqAuthId: {
                        $elemMatch: {
                            _id: req.params.id
                        }
                    }
                }, {
                    $pull: {
                        reqAuthId: {
                            _id: req.params.id
                        }
                    }
                });


                /* Find Blog Data By Liked Collection Using UserId */
                const findBlogDataCmt = await BlogComment.find({
                    comment: {
                        $elemMatch: {
                            user_id: req.params.id
                        }
                    }
                }).select('blog_id');

                for (const getBlogId of findBlogDataCmt) {

                    await Blog.updateOne(
                        {
                            _id: getBlogId.blogId
                        },
                        {
                            $inc: {
                                comment: -1
                            }
                        }
                    );

                }

                /* Delete User Like Data From BLog Like Collection */
                await BlogComment.updateMany({
                    comment: {
                        $elemMatch: {
                            user_id: req.params.id
                        }
                    }
                }, {
                    $pull: {
                        comment: {
                            user_id: req.params.id
                        }
                    }
                });


                if (findBlogComm.length == 0) {
                } else {

                    for (const respCommt of findBlogComm) {

                        const delComtBlog = await BlogComment.findByIdAndUpdate({
                            _id: respCommt._id
                        }, {
                            $pull: {
                                comment: {
                                    user_id: req.params.id
                                }
                            }
                        });
                        console.log("delComtBlog::", delComtBlog);

                        await Blog.updateOne(
                            {
                                _id: respCommt.blog_id
                            },
                            {
                                $inc: {
                                    comment: -1
                                }
                            }
                        );

                    }

                }

                const findBlogLike = await BlogLike.find({
                    reqAuthId: {
                        $elemMatch: {
                            _id: mongoose.Types.ObjectId(req.params.id)
                        }
                    }
                });

                if (findBlogLike.length == 0) {
                } else {


                    for (const respLike of findBlogLike) {

                        const delLikeBlog = await BlogLike.findByIdAndUpdate({
                            _id: respLike._id
                        }, {
                            $pull: {
                                reqAuthId: {
                                    _id: req.params.id
                                }
                            }
                        });

                        await Blog.updateOne(
                            {
                                _id: respLike.blog_id
                            },
                            {
                                $inc: {
                                    like: -1
                                }
                            }
                        );

                    }

                }

            }

            /* - - - - - - - End Blog Portion - - - - - - - */


            /* Find Chat Room */
            const findChatRoom = await chatRoomModel.find({
                $or: [{
                    user1: req.params.id
                }, {
                    user2: req.params.id
                }]
            });

            /* Delete Chat */
            for (const roomId of findChatRoom) {
                await chatModel.deleteOne({
                    chatRoomId: roomId._id
                })
            }

            /* Delete Chat Room Data */
            await chatRoomModel.deleteOne({
                user1: req.params.id
            })

            /* Delete Chat Room */
            await chatRoomModel.deleteOne({
                user2: req.params.id
            })

            /* Find Post Data */
            const findPostData = await UserPost.find({ user_id: req.params.id })
            console.log("findPostData", findPostData);

            /* Delete Post */
            await UserPost.deleteMany({
                user_id: req.params.id
            })


            /* Find User Post Data By UserId */
            const getUserPostCmt = await UserPostComment.find({
                comment: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }).select('post_id');

            /* Update Comment In User Post Collection */
            for (const commentData of getUserPostCmt) {

                await UserPost.updateOne(
                    {
                        _id: commentData.post_id
                    },
                    {
                        $inc: {
                            comments: -1
                        }
                    }
                );

            }

            /* Delete User Post Comment */
            await UserPostComment.updateOne({
                comment: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }, {
                $pull: {
                    comment: {
                        user_id: req.params.id
                    }
                }
            });


            /* Find User Post Data By UserId For UserPost Like*/
            const getUserPostLike = await UserPostLike.find({
                reqAuthId: {
                    $elemMatch: {
                        _id: req.params.id
                    }
                }
            }).select('post_id');

            /* Update Comment In User Post Collection For UserPost Like */
            for (const likeData of getUserPostLike) {

                await UserPost.updateOne(
                    {
                        _id: likeData.post_id
                    },
                    {
                        $inc: {
                            likes: -1
                        }
                    }
                );

            }

            /* Delete User Post Like */
            await UserPostLike.updateOne({
                reqAuthId: {
                    $elemMatch: {
                        _id: req.params.id
                    }
                }
            }, {
                $pull: {
                    reqAuthId: {
                        _id: req.params.id
                    }
                }
            });


            /* Delete Post Comment/Like */
            for (const postData of findPostData) {
                await UserPostComment.deleteOne({
                    post_id: postData._id
                })

                await UserPostLike.deleteOne({
                    post_id: postData._id
                })
            }

            /* Find Blog Data */
            const findBlogData = await Blog.find({ user_id: req.params.id })

            /* Delete Many Blog */
            await Blog.deleteMany({
                user_id: req.params.id
            })

            /* Delete Blog Comment & Like */
            for (const blogData of findBlogData) {
                await BlogComment.deleteOne({
                    blog_id: blogData._id
                })

                await BlogLike.deleteOne({
                    blog_id: blogData._id
                })
            }

            /* Delete Activity */
            await Activity.deleteMany({
                user_id: req.params.id
            })

            /* Delete Group Member */
            await GroupMember.updateOne({
                users: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }, {
                $pull: {
                    users: {
                        user_id: req.params.id
                    }
                }
            });

            /* Delete Notification Data BY UserId */
            await Notification.deleteMany(
                {
                    user_id: req.params.id
                });

            /* Find Group By UserId */
            const findGroup = await GroupMember.find({
                users: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            });
            console.log("findGroup::", findGroup);

            /* Descrease Group Memeber Number */
            for (const groupResp of findGroup) {

                await Group.updateOne(
                    {
                        _id: groupResp.group_id
                    },
                    {
                        $inc: {
                            group_members: -1
                        }
                    }
                );

            }


            /* Decrease Group Memeber Number */
            const findMember = await GroupMember.find({
                users: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }).select('group_id');
            console.log("findMember::", findMember);

            for (const getGroupId of findMember) {
                console.log('getGroupId::', getGroupId);

                await Group.updateOne({
                    _id: getGroupId.group_id
                }, {
                    $inc: {
                        group_members: -1
                    }
                });

                await GroupList.updateOne({
                    group_id: getGroupId.group_id
                }, {
                    $inc: {
                        group_members: -1
                    }
                });

            }

            /* Delete GroupMember On List By UserId */
            await GroupMember.updateMany({
                users: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }, {
                $pull: {
                    users: {
                        user_id: req.params.id
                    }
                }
            });


            /* Delete Comment From Group Post By UserId */
            await GroupPostComm.updateOne({
                comment: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }, {
                $pull: {
                    comment: {
                        user_id: req.params.id
                    }
                }
            });

            /* Delete From Group List */
            const delGroupList = await GroupList.deleteMany({ user_id: req.params.id });

            /* Find Group Data */
            const getGroup = await Group.find({ user_id: req.params.id });

            /* Delete Group Post /~> Post Related Comment,Like /~> GroupMemeberList  */
            for (const respData of getGroup) {

                /* Delete Group & GroupMember & Notification & GroupChatRoom & GroupChat By GroupId */
                const delGroup = await Group.deleteOne({ _id: respData._id });
                const delGroupList = await GroupList.deleteOne({ group_id: respData._id });
                const delGroupMemberList = await GroupMember.deleteOne({ group_id: respData._id });
                const delGroupNoti = await Notification.deleteOne({ group_id: respData._id });
                const delGroupChatRoom = await GroupChatRoom.deleteOne({ groupId: respData._id });
                const delGroupChat = await GroupChat.deleteOne({ groupId: respData._id });

                /* Find Group Post By GroupId */
                const groupPost = await GroupPost.find({ group_id: respData._id });

                for (const respPost of groupPost) {
                    console.log("respPost:::", respPost);

                    /* Delete GroupPost & GroupPostLike & GroupPostComment By PostId */
                    const delPost = await GroupPost.deleteOne({ _id: respPost._id });
                    const delPostLike = await GroupPostLike.deleteOne({ post_id: respPost._id });
                    const delPostComm = await GroupPostComm.deleteOne({ post_id: respPost._id });

                }

            }

            /* Delete User From Friend Request Table */
            const delFrdData = await FriendRequest.deleteMany({
                user_id: req.params.id
            });

            const delReqFrdData = await FriendRequest.deleteMany({
                requested_user_id: req.params.id
            });


            /* Delete Group Chat Room By UserId */
            await GroupChatRoom.updateOne({
                users: {
                    $elemMatch: {
                        userId: req.params.id
                    }
                }
            }, {
                $pull: {
                    users: {
                        userId: req.params.id
                    }
                }
            });

            /* Delete Group Chat By UserId */
            await GroupChat.updateOne({
                chat: {
                    $elemMatch: {
                        sender: req.params.id
                    }
                }
            }, {
                $pull: {
                    chat: {
                        sender: req.params.id
                    }
                }
            });


            res.status(status.OK).json(
                {
                    message: "User Logout Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                }
            )

        }

    } catch (error) {
        console.log("userLogout:::error", error);
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

exports.userUpdate = async (req, res) => {
    try {

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

        const updateData = await authModel.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                profile: urls,
                username: req.body.username,
                email: req.body.email,
                country_code: req.body.country_code,
                phone_number: req.body.phone_number,
                age: req.body.age,
                gender: req.body.gender,
                password: req.body.password,
                user_type: req.body.user_type
            }
        }, {
            new: true,
            useFindAndModify: false
        }).then(() => {
            res.status(status.OK).json(
                {
                    message: "User Detail Update Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )
        })

    } catch (error) {
        console.log("error::", error);

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

exports.updateUserVehicleData = async (req, res) => {
    try {

        const updateData = await authModel.findOneAndUpdate(
            {
                _id: req.params.id
            },
            {
                $set: {
                    vehicle: req.body.vehicle
                }
            }
        ).then(() => {
            res.status(status.OK).json({
                message: "User Vehicle Detail Update Successfully",
                status: true,
                code: 200,
                statusCode: 1
            })
        }).catch((err) => {
            res.status(status.INTERNAL_SERVER_ERROR).json(
                {
                    message: "Somthing Went Wrong data not updated",
                    status: false,
                    code: 501,
                    statusCode: 0
                }
            )
        })

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

exports.userVehicleUpdateData = async (req, res) => {
    try {

        const updateVehicleData = await authModel.findOneAndUpdate({
            _id: req.params.id,
        }, {
            $set: {
                "vehicle.$.vehicle_type": req.body.type,
                "vehicle.$.model": req.body.model,
                "vehicle.$.trim": req.body.trim,
                "vehicle.$.year": req.body.year,
                "vehicle.$.daily_driving": req.body.daily_driving,
                "vehicle.$.unit": req.body.unit
            }
        }).then(() => {
            res.status(status.OK).json(
                {
                    message: "User Vehicle Detail Update Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )
        }).catch((error) => {

            console.log("error::", error);

            res.status(status.INTERNAL_SERVER_ERROR).json(
                {
                    message: "Somthing Went Wrong",
                    status: false,
                    code: 501,
                    statusCode: 0
                }
            )
        })

    } catch (error) {
        console.log("error::", error);

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

exports.addImage = async (req, res) => {
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

        const ImageUpdat = await authModel.findByIdAndUpdate({ _id: userId }, {
            $set: {
                profile: urls
            }
        }, {
            new: true,
            useFindAndModify: false
        })

        const getUserData = await authModel.findOne({ _id: userId });

        const response = {
            user_id: getUserData._id,
            profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
            username: getUserData.username,
            email: getUserData.email,
            country_code: getUserData.country_code,
            phone_number: getUserData.phone_number,
            age: getUserData.age,
            gender: getUserData.gender,
            user_type: getUserData.user_type,
            password: getUserData.password,
            fcm_token: getUserData.fcm_token,
            longitude: getUserData.location.coordinates[0],
            latitude: getUserData.location.coordinates[1],
            vehicle: getUserData.vehicle
        }

        res.status(status.OK).json(
            {
                message: "User Detail Update Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: response
            }
        )

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

exports.changePassword = async (req, res) => {
    try {

        let userId = req.params.id;

        const oldPassword = req.body.old_password;
        const newPassword = req.body.new_password;
        const confirmPassword = req.body.confirm_password;

        const getUser = await authModel.findOne({ _id: userId });
        console.log("getUser::", getUser);

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

            if (getUser.password == oldPassword) {

                if (newPassword == confirmPassword) {

                    const updatePassword = await authModel.updateOne({
                        _id: userId
                    }, {
                        $set: {
                            password: newPassword
                        }
                    })

                    res.status(status.OK).json(
                        {
                            message: "Password has been updated successfully",
                            status: true,
                            code: 200,
                            statusCode: 1,
                            data: userId
                        }
                    )

                } else {

                    res.status(status.UNAUTHORIZED).json(
                        {
                            message: "New password Or Confirm Password doest not match",
                            status: false,
                            code: 404,
                            statusCode: 0
                        }
                    )

                }

            } else {

                res.status(status.UNAUTHORIZED).json(
                    {
                        message: "Old password does not match with exist password",
                        status: false,
                        code: 404,
                        statusCode: 0
                    }
                )

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

exports.forgetPassword = async (req, res) => {
    try {

        const email = req.body.email;
        const findUser = await authModel.findOne({ email: email });
        console.log("findUser::", findUser);

        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            var createPass = '';
            var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890@#$%&';

            for (let i = 0; i < 6; i++) {
                var char = Math.floor(Math.random() * str.length + 1)
                createPass += str.charAt(char)
            }
            console.log("createPass::", createPass);

            // --- content for mail --- //
            let sub = 'Reset Your Password'
            let html = `<h3>Hello User, <br/> You forget you password, Don't worry Here your new password <u> ${createPass} </u></h3>
            <p>If you didn't request for a new password. Then you can safely ignore this email.</p><br/>
            <h4>Thank You</h4>`

            await mailService(findUser.email, sub, html)

            console.log("findUser._id::::", findUser._id);
            console.log("createPass::::", createPass);

            const updateUserPassword = await authModel.updateOne({
                _id: findUser._id
            }, {
                $set: {
                    password: createPass
                }
            });

            res.status(status.OK).json(
                {
                    message: "Your new password has been sent on your register mail",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: findUser.email
                }
            )

        }

    } catch (error) {

        console.log("forgetPassword-Error::", error);
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

exports.checkMail = async (req, res) => {
    try {

        const findUserData = await authModel.findOne({ email: req.params.email })

        if (findUserData) {

            res.status(status.NOT_ACCEPTABLE).json(
                {
                    message: "Email Is Already Exist",
                    status: false,
                    code: 406,
                    statusCode: 0
                }
            )

        } else {

            res.status(status.OK).json(
                {
                    message: "You Can Use This Email",
                    status: false,
                    code: 200,
                    statusCode: 1
                }
            )

        }

    } catch (error) {

        console.log("checkMail-Error::", error);
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

exports.followingList = async (req, res) => {
    try {

        const userId = req.params.userId;

        const getFollowing = await FriendRequest.find(
            {
                user_id: userId,
                status: 2
            }
        );
        console.log("getFollowing", getFollowing);

        const response = [];
        for (const respData of getFollowing) {

            const finalRes = {
                userId: userId,
                userImage: respData.requested_user_img,
                userName: respData.requested_user_name
            }
            response.push(finalRes);

        }
        console.log("response", response);

        res.status(status.OK).json(
            {
                message: "Your Following User List",
                status: true,
                code: 200,
                statusCode: 1,
                data: response
            }
        )


    } catch (error) {

        console.log("followingList--Error::", error);
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



exports.testing = async (req, res) => {
    try {

        console.log('hello');

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