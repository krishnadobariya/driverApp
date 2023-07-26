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
const MatchUsers = require("../models/matchUsers.model")
const JoinEvent = require("../models/joinEvent.model");
const InAppPurchase = require("../models/inAppPurchase.model");
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
                que_five: req.body.que_five,
                que_six: req.body.que_six,
                que_seven: req.body.que_seven,
                que_eight: req.body.que_eight,
                que_nine: req.body.que_nine,
                que_ten: req.body.que_ten,
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
                vehicle: saveData.vehicle,
                questions: saveQue
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
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        // --- get user whithout user that id pass --- //
        const blockUserId = [];
        const getUser = await authModel.find({
            _id: {
                $ne: userId
            }
        }).select('-__v').sort({ createdAt: -1 });
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
                                unit: vehicleData.unit,
                                duration: vehicleData.duration,
                                distance: vehicleData.distance
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
                            age: userDetails.age,
                            gender: userDetails.gender,
                            phone: `${userDetails.country_code}${userDetails.phone_number}`,
                            chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                            vehicles: arrVehicleData
                        }
                        vehicleDetails.push(response)
                    }

                    // vehicleDetails.push(userDetails)
                }

            }

            // --------- first 64aee961671f9ca786fdce03 this user ----------

            function moveElementToFront(arr, userId) {
                const index = arr.findIndex((item) => item.user_id == userId);
                if (index > 0) {
                    const element = arr.splice(index, 1)[0];
                    arr.unshift(element);
                }
            }

            const targetUserId = "64aee961671f9ca786fdce03";
            moveElementToFront(vehicleDetails, targetUserId);

            console.log(vehicleDetails);

            // --------- first 64aee961671f9ca786fdce03 this user ----------

            function paginateArray(array, currentPage, itemsPerPage) {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;

                return array.slice(startIndex, endIndex);
            }

            const paginatedArray = paginateArray(vehicleDetails, page, limit);
            console.log(paginatedArray);

            res.status(status.OK).json(
                {
                    message: "Get User Detail Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: paginatedArray
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
        console.log("userProfile:::", getUserData);

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

            const getAnswer = await Question.findOne({ user_id: req.params.id }).select({
                'que_one': 1, 'que_two': 1, 'que_three': 1, 'que_four': 1, 'que_five': 1, 'que_six': 1, 'que_seven': 1, 'que_eight': 1, 'que_nine': 1, 'que_ten': 1, '_id': 0
            });

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

                    // To show how long a post has been posted //
                    var now = new Date();
                    var addingDate = new Date(respPost.createdAt);
                    var sec_num = (now - addingDate) / 1000;
                    var days = Math.floor(sec_num / (3600 * 24));
                    console.log("days", days);
                    var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                    var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                    var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                    if (hours < 10) { hours = "0" + hours; }
                    if (minutes < 10) { minutes = "0" + minutes; }
                    if (seconds < 10) { seconds = "0" + seconds; }

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
                    // End Of to show how long a post has been posted //

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

            // Count User Post, Follower, Following //
            const postCount = await UserPost.find({ user_id: getUserData._id }).count();
            console.log('postCount::', postCount);

            const followingCount = await FriendRequest.find({
                user_id: getUserData._id,
                status: 2
            }).count();

            console.log("followingCount::", followingCount);

            const countFollower = await FriendRequest.find({
                requested_user_id: getUserData._id,
                status: 2
            }).count();
            const followerCount = countFollower
            console.log("followerCount::", followerCount);

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
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const startIndex = (page - 1) * limit;
        const endIndex = limit * 1;

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

            /* Delete Notification Data BY UserId */
            await Notification.deleteMany(
                {
                    user_id: req.params.id
                });


            /* ----- Delete Group , Group Post , Group Like , Group Comment ----- */

            //  Delete From Group List 
            const delGroupList = await GroupList.deleteMany({ user_id: req.params.id });

            //  Find Group Data 
            const getGroup = await Group.find({ user_id: req.params.id });
            console.log("getGroup", getGroup);

            //  Delete Group Post /~> Post Related Comment,Like /~> GroupMemeberList  
            for (const respData of getGroup) {

                //  Delete Group & GroupMember & Notification & GroupChatRoom & GroupChat By GroupId 
                const delGroup = await Group.deleteOne({ _id: respData._id });
                const delGroupList = await GroupList.deleteOne({ group_id: respData._id });
                const delGroupMemberList = await GroupMember.deleteOne({ group_id: respData._id });
                const delGroupNoti = await Notification.deleteOne({ group_id: respData._id });
                const delGroupChatRoom = await GroupChatRoom.deleteOne({ groupId: respData._id });
                const delGroupChat = await GroupChat.deleteOne({ groupId: respData._id });

            }

            // Find Group Post By GroupId 
            const groupPost = await GroupPost.find({ user_id: req.params.id });
            console.log("groupPost", groupPost);

            for (const respPost of groupPost) {
                console.log("respPost:::", respPost);

                // const findPost = await GroupPost.findOne({ _id: mongoose.Types.ObjectId(respPost._id) });
                // console.log("findPost", findPost);

                // Delete GroupPost & GroupPostLike & GroupPostComment By PostId 
                const delPost = await GroupPost.deleteOne({ _id: mongoose.Types.ObjectId(respPost._id) });
                const delPostLike = await GroupPostLike.deleteOne({ post_id: respPost._id });
                const delPostComm = await GroupPostComm.deleteOne({ post_id: respPost._id });

            }

            // Decrease Group Memeber Number 
            const findMember = await GroupMember.find({
                users: {
                    $elemMatch: {
                        user_id: req.params.id
                    }
                }
            }).select('group_id');
            console.log("findMember::", findMember);

            for (const getGroupId of findMember) {

                const findGroup = await Group.findOne({ _id: getGroupId.group_id })
                await Group.updateOne(
                    {
                        _id: getGroupId.group_id
                    },
                    {
                        $set: {
                            group_members: findGroup.group_members - 1
                        }
                    }
                );

                await GroupList.updateOne(
                    {
                        group_id: getGroupId.group_id
                    },
                    {
                        $set: {
                            group_members: findGroup.group_members - 1
                        }
                    }
                );

                await GroupMember.updateMany(
                    {
                        users: {
                            $elemMatch: {
                                user_id: mongoose.Types.ObjectId(req.params.id)
                            }
                        }
                    }, {
                    $pull: {
                        users: {
                            user_id: req.params.id
                        }
                    }
                });

            }
            // End Decrease Group Memeber Number 

            /* ----- End Delete Group , Group Post , Group Like , Group Comment ----- */


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

            /* Delete User Question By UserId */
            await Question.deleteMany({
                user_id: req.params.id
            })

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
                userId: respData.requested_user_id,
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

exports.followerList = async (req, res) => {
    try {

        const userId = req.params.userId;

        const getFollowing = await FriendRequest.find(
            {
                requested_user_id: userId,
                status: 2
            }
        );
        console.log("getFollowing", getFollowing);

        const response = [];
        for (const respData of getFollowing) {

            const finalRes = {
                userId: respData.user_id,
                userImage: respData.user_img,
                userName: respData.user_name
            }
            response.push(finalRes);

        }

        res.status(status.OK).json(
            {
                message: "Your Follower User List",
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

exports.removeFollowing = async (req, res) => {
    try {

        const userId = req.params.userId;
        const removeUserId = req.params.removeUserId

        const getFollowing = await FriendRequest.findOne(
            {
                userId: userId,
                requested_user_id: removeUserId
            }
        );
        console.log("getFollowing", getFollowing);

        if (getFollowing == null) {

            res.status(status.NOT_ACCEPTABLE).json(
                {
                    message: "This User Is Not Your Following",
                    status: false,
                    code: 406,
                    statusCode: 0
                }
            )

        } else {

            const deleteFollower = await FriendRequest.deleteOne({ _id: getFollowing._id })

            res.status(status.OK).json(
                {
                    message: "Following Remove Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )

        }

    } catch (error) {

        console.log("removeFollower--Error::", error);
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

exports.removeFollower = async (req, res) => {
    try {

        const userId = req.params.userId;
        const removeUserId = req.params.removeUserId

        const getFollower = await FriendRequest.findOne(
            {
                userId: removeUserId,
                requested_user_id: userId
            }
        );
        console.log("getFollower", getFollower);

        if (getFollower == null) {

            res.status(status.NOT_ACCEPTABLE).json(
                {
                    message: "This User Is Not Your Follower",
                    status: false,
                    code: 406,
                    statusCode: 0
                }
            )

        } else {

            const deleteFollower = await FriendRequest.deleteOne({ _id: getFollower._id })

            res.status(status.OK).json(
                {
                    message: "Follower Remove Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )

        }

    } catch (error) {

        console.log("removeFollower--Error::", error);
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

// search with username and vehical type
exports.searchData = async (req, res) => {
    try {

        let userId = req.params.id;
        var pattern = `^${req.body.name}`
        var type = req.body.type;

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        // const findUserData = await authModel.find({ username: { $regex: pattern, $options: 'i' } }).skip(startIndex).limit(endIndex);
        // console.log("findUserData", findUserData);

        const findUserData = await authModel.findOne({ _id: userId }).sort({ createdAt: -1 })
        console.log("findUserData", findUserData);

        if (findUserData == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Found",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            let findUser = await authModel.aggregate([
                {
                    $match: {
                        _id: { $ne: findUserData._id },
                        username: { $regex: pattern, $options: 'i' }
                    }
                },
                {
                    $match: {
                        $and:
                            [
                                { "vehicle.vehicle_type": type }
                            ]
                    }
                }
            ]).sort({ createdAt: -1 })
            console.log("findUser::", findUser);

            var userDataArr = []
            for (const findVehicalData of findUser) {

                const findBlockUser = await Block.find({
                    user_id: userId,
                    block_user_id: findVehicalData._id
                });

                if (findBlockUser.length != 0) {

                } else {

                    var finalChatId = "";
                    finalChatId = await chatRoomModel.find(
                        {
                            user1: findVehicalData._id,
                            user2: userId,
                        }
                    );

                    if (finalChatId.length == 0) {
                        finalChatId = await chatRoomModel.find(
                            {
                                user2: findVehicalData._id,
                                user1: userId,
                            }
                        );

                    }

                    var vehicleDataArr = []
                    var isVehicleData = false;
                    // console.log("findVehicalData", findVehicalData);
                    for (const getVehical of findVehicalData.vehicle) {

                        // console.log("getVehical", getVehical);
                        if (getVehical.vehicle_type == type) {
                            isVehicleData = true;
                            const response = {
                                vehicleImageId: getVehical.vehicle_img_id,
                                model: getVehical.model,
                                type: getVehical.vehicle_type,
                                year: getVehical.year,
                                trim: getVehical.trim,
                                dailyDriving: getVehical.daily_driving,
                                unit: getVehical.unit
                            }
                            vehicleDataArr.push(response)
                        }

                    }
                    if (isVehicleData) {
                        const response = {
                            user_id: findVehicalData._id,
                            profile: findVehicalData.profile[0] ? findVehicalData.profile[0].res : "",
                            userName: findVehicalData.username,
                            email: findVehicalData.email,
                            phone: `${findVehicalData.country_code}${findVehicalData.phone_number}`,
                            chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                            vehicles: vehicleDataArr
                        }
                        userDataArr.push(response)
                    }

                }

            }

            function paginateArray(array, currentPage, itemsPerPage) {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;

                return array.slice(startIndex, endIndex);
            }

            const paginatedArray = paginateArray(userDataArr, page, limit);
            console.log(paginatedArray);

            res.status(status.OK).json(
                {
                    message: "User View Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: paginatedArray
                }
            )

        }

    } catch (error) {

        console.log("searchByName--Error::", error);
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

// search with Vehicle type , vehicle_img_id and questions
// exports.searchByVehical = async (req, res) => {
//     try {

//         const userId = req.params.userId

//         const findUser = await authModel.findOne({ _id: userId })
//         console.log("findUser", findUser);

//         if (findUser == null) {

//             res.status(status.NOT_FOUND).json(
//                 {
//                     message: "User Not Found",
//                     status: false,
//                     code: 404,
//                     statusCode: 0
//                 }
//             )

//         } else {

//             const findOtherUser = await authModel.find({ _id: { $ne: userId } })
//             console.log("findOtherUser", findOtherUser.length);

//             var userDataArr = []
//             for (const checkVehicalData of findOtherUser) {

//                 // console.log("checkVehicalData", checkVehicalData);

//                 const findBlockUser = await Block.find({
//                     user_id: userId,
//                     block_user_id: checkVehicalData._id
//                 });

//                 if (findBlockUser.length != 0) {

//                 } else {

//                     var finalChatId = "";
//                     finalChatId = await chatRoomModel.find(
//                         {
//                             user1: checkVehicalData._id,
//                             user2: userId,
//                         }
//                     );

//                     if (finalChatId.length == 0) {
//                         finalChatId = await chatRoomModel.find(
//                             {
//                                 user2: checkVehicalData._id,
//                                 user1: userId,
//                             }
//                         );

//                     }

//                     const findUserQuestion = await Question.findOne({ user_id: userId })
//                     // console.log("findUserQuestion", findUserQuestion);

//                     const findQuestionData = await Question.findOne({
//                         user_id: checkVehicalData._id,
//                         que_one: findUserQuestion.que_one,
//                         que_two: findUserQuestion.que_two,
//                         que_three: findUserQuestion.que_three,
//                         que_four: findUserQuestion.que_four,
//                         que_five: findUserQuestion.que_five,
//                         que_six: findUserQuestion.que_six,
//                         // $or: [
//                         //     { $and: [{ que_one: findUserQuestion.que_one, que_two: findUserQuestion.que_two, que_three: findUserQuestion.que_three }] },
//                         //     { $and: [{ que_two: findUserQuestion.que_two, que_three: findUserQuestion.que_three, que_four: findUserQuestion.que_four }] },
//                         //     { $and: [{ que_one: findUserQuestion.que_one, que_three: findUserQuestion.que_three, que_four: findUserQuestion.que_four }] },
//                         //     { $and: [{ que_one: findUserQuestion.que_one, que_two: findUserQuestion.que_two, que_four: findUserQuestion.que_four }] },
//                         //     { $and: [{ que_one: findUserQuestion.que_one, que_two: findUserQuestion.que_two, que_three: findUserQuestion.que_three, que_four: findUserQuestion.que_four }] }
//                         // ]
//                     })
//                     // console.log("findQuestionData", findQuestionData);

//                     var vehicleDataArr = []
//                     var isVehicleData = false;
//                     if (findQuestionData) {

//                         for (const getVehical of checkVehicalData.vehicle) {

//                             if (getVehical.vehicle_img_id == findUser.vehicle[0].vehicle_img_id && getVehical.vehicle_type == checkVehicalData.vehicle[0].vehicle_type) {

//                                 isVehicleData = true;
//                                 const response = {
//                                     vehicleImageId: getVehical.vehicle_img_id,
//                                     model: getVehical.model,
//                                     type: getVehical.vehicle_type,
//                                     year: getVehical.year,
//                                     trim: getVehical.trim,
//                                     dailyDriving: getVehical.daily_driving,
//                                     unit: getVehical.unit,
//                                     duration: getVehical.duration,
//                                     distance: getVehical.distance
//                                 }
//                                 vehicleDataArr.push(response)
//                             }

//                         }

//                     }

//                     // console.log("vehicleDataArr", vehicleDataArr);
//                     if (isVehicleData) {
//                         const response = {
//                             user_id: checkVehicalData._id,
//                             profile: checkVehicalData.profile[0] ? checkVehicalData.profile[0].res : "",
//                             userName: checkVehicalData.username,
//                             email: checkVehicalData.email,
//                             phone: `${checkVehicalData.country_code}${checkVehicalData.phone_number}`,
//                             age: checkVehicalData.age,
//                             gender: checkVehicalData.gender,
//                             vehicles: vehicleDataArr,
//                             chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
//                             que_one: findQuestionData.que_one,
//                             que_two: findQuestionData.que_two,
//                             que_three: findQuestionData.que_three,
//                             que_four: findQuestionData.que_four,
//                             que_five: findUserQuestion.que_five,
//                             que_six: findUserQuestion.que_six,
//                         }
//                         userDataArr.push(response)
//                     }

//                 }
//                 console.log("userDataArr", userDataArr.length);
//             }


//             res.status(status.OK).json(
//                 {
//                     message: "User View Successfully",
//                     status: true,
//                     code: 200,
//                     statusCode: 1,
//                     data: userDataArr
//                 }
//             )

//         }

//     } catch (error) {

//         console.log("searchByVehical--Error::", error);
//         res.status(status.INTERNAL_SERVER_ERROR).json(
//             {
//                 message: "Something Went Wrong",
//                 status: false,
//                 code: 500,
//                 statusCode: 0,
//                 error: error.message
//             }
//         )

//     }
// }

exports.matchUser = async (req, res) => {
    try {

        const userId = req.params.userId

        const findUser = await authModel.findOne({ _id: userId })
        // console.log("findUser", findUser);

        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Found",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            var userDataArr = []

            const findQuestionData = await MatchUsers.find({
                user_id: userId
            })

            var ids = [];
            let total_count = 0;
            let match_count = 0
            for (const findmatchUserId of findQuestionData) {
                ids.push(...findmatchUserId.match_user);
                total_count = parseInt(findmatchUserId.credit) + parseInt(total_count)
                match_count = parseInt(match_count) + parseInt(findmatchUserId.match_count)
            }
            console.log("ids======", ids);

            for (const checkVehicalData of ids) {
                console.log("checkVehicalData", checkVehicalData);

                const getUserData = await authModel.findOne({ _id: checkVehicalData })
                const findQue = await Question.findOne({ user_id: checkVehicalData })
                console.log("getUserData", getUserData);

                if (getUserData != null) {
                    const findBlockUser = await Block.find({
                        user_id: userId,
                        block_user_id: checkVehicalData.user_id
                    });

                    if (findBlockUser.length != 0) {

                    } else {
                        var finalChatId = "";
                        finalChatId = await chatRoomModel.find(
                            {
                                user1: checkVehicalData.user_id,
                                user2: userId,
                            }
                        );

                        if (finalChatId.length == 0) {
                            finalChatId = await chatRoomModel.find(
                                {
                                    user2: checkVehicalData.user_id,
                                    user1: userId,
                                }
                            );

                        }

                        var vehicleDataArr = []
                        var isVehicleData = false;

                        for (const getVehical of getUserData.vehicle) {
                            isVehicleData = true;
                            const response = {
                                vehicleImageId: getVehical.vehicle_img_id,
                                model: getVehical.model,
                                type: getVehical.vehicle_type,
                                year: getVehical.year,
                                trim: getVehical.trim,
                                dailyDriving: getVehical.daily_driving,
                                unit: getVehical.unit,
                                duration: getVehical.duration,
                                distance: getVehical.distance
                            }
                            vehicleDataArr.push(response)
                        }

                        const getInAppPurchase = await InAppPurchase.find({ user_id: getUserData._id, subscription_type: 2 })
                        console.log('getInAppPurchase', getInAppPurchase);

                        var credit = 0
                        for (const creditSum of getInAppPurchase) {
                            credit += parseFloat(creditSum.credit)
                        }
                        // console.log("credit", credit);

                        function getElements(array, number) {
                            console.log("array", array, "number", number);
                            return array.slice(0, number);
                        }

                        const userIds = getElements(ids, credit)
                        if (isVehicleData) {
                            const response = {
                                user_id: getUserData._id,
                                profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
                                userName: getUserData.username,
                                email: getUserData.email,
                                phone: `${getUserData.country_code}${getUserData.phone_number}`,
                                age: getUserData.age,
                                gender: getUserData.gender,
                                vehicles: vehicleDataArr,
                                chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                                questions: [
                                    {
                                        que_one: findQue.que_one,
                                        que_two: findQue.que_two,
                                        que_three: findQue.que_three,
                                        que_four: findQue.que_four,
                                        que_five: findQue.que_five,
                                        que_six: findQue.que_six,
                                    }
                                ],
                                match_user: userIds,
                            }
                            userDataArr.push(response)
                        }
                    }
                }
            }

            res.status(status.OK).json(
                {
                    message: "User View Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: userDataArr,
                    total_count: total_count,
                    match_count: match_count
                }
            )

        }

    } catch (error) {

        console.log("searchByVehical--Error::", error);
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

exports.allMatchUser = async (req, res) => {
    try {

        const userId = req.params.userId

        const findUser = await authModel.findOne({ _id: userId })
        // console.log("findUser", findUser);

        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Found",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const findUserQuestion = await Question.findOne({
                user_id: userId,
            });
            const findQuestionData = await Question.find({
                user_id: { $ne: userId },
                que_one: findUserQuestion.que_one,
                que_two: findUserQuestion.que_two,
                que_three: findUserQuestion.que_three,
                que_four: findUserQuestion.que_four,
                que_five: findUserQuestion.que_five,
                que_six: findUserQuestion.que_six,
            }).select("user_id -_id");
            console.log("findQuestionData", findQuestionData);

            const idArr = []
            for (const getIds of findQuestionData) {
                const findUserData = await authModel.findOne({ _id: getIds.user_id });

                if (findUserData) {
                    idArr.push(getIds.user_id)
                }

            }
            console.log("idArr", idArr);

            const findMatchUser = await MatchUsers.findOne({ user_id: userId })

            if (findMatchUser) {
                await MatchUsers.findOneAndUpdate(
                    {
                        _id: findMatchUser._id
                    },
                    {
                        match_user: idArr,
                        match_count: idArr.length
                    }
                )
            } else {
                const insertMatchUser = new MatchUsers({
                    user_id: userId,
                    match_user: idArr,
                    match_count: idArr.length
                });
                await insertMatchUser.save();
            }

            var userDataArr = []
            for (const checkVehicalData of idArr) {
                console.log("checkVehicalData", checkVehicalData);

                const getUserData = await authModel.findOne({ _id: checkVehicalData })
                const findQue = await Question.findOne({ user_id: checkVehicalData })
                console.log("getUserData", getUserData);

                if (getUserData != null) {
                    const findBlockUser = await Block.find({
                        user_id: userId,
                        block_user_id: checkVehicalData.user_id
                    });

                    if (findBlockUser.length != 0) {

                    } else {
                        var finalChatId = "";
                        finalChatId = await chatRoomModel.find(
                            {
                                user1: checkVehicalData.user_id,
                                user2: userId,
                            }
                        );

                        if (finalChatId.length == 0) {
                            finalChatId = await chatRoomModel.find(
                                {
                                    user2: checkVehicalData.user_id,
                                    user1: userId,
                                }
                            );

                        }

                        var vehicleDataArr = []
                        var isVehicleData = false;

                        for (const getVehical of getUserData.vehicle) {
                            isVehicleData = true;
                            const response = {
                                vehicleImageId: getVehical.vehicle_img_id,
                                model: getVehical.model,
                                type: getVehical.vehicle_type,
                                year: getVehical.year,
                                trim: getVehical.trim,
                                dailyDriving: getVehical.daily_driving,
                                unit: getVehical.unit,
                                duration: getVehical.duration,
                                distance: getVehical.distance
                            }
                            vehicleDataArr.push(response)
                        }

                        const getMatch = await MatchUsers.findOne({ user_id: getUserData._id })
                        console.log('getMatch', getMatch);

                        if (isVehicleData) {
                            const response = {
                                user_id: getUserData._id,
                                profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
                                userName: getUserData.username,
                                email: getUserData.email,
                                phone: `${getUserData.country_code}${getUserData.phone_number}`,
                                age: getUserData.age,
                                gender: getUserData.gender,
                                vehicles: vehicleDataArr,
                                chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                                questions: [
                                    {
                                        que_one: findQue.que_one,
                                        que_two: findQue.que_two,
                                        que_three: findQue.que_three,
                                        que_four: findQue.que_four,
                                        que_five: findQue.que_five,
                                        que_six: findQue.que_six,
                                    }
                                ],
                                match_user: getMatch == null ? "" : getMatch.match_user,
                            }
                            userDataArr.push(response)
                        }
                    }
                }
            }

            res.status(status.CREATED).json({
                message: "Match User View Successfully",
                status: true,
                code: 201,
                statusCode: 1,
                data: userDataArr
            });

        }

    } catch (error) {

        console.log("searchByVehical--Error::", error);
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

exports.topTenUser = async (req, res) => {
    try {
        let userId = req.params.id;
        const blockUserId = [];
        const getUser = await authModel.find({
            _id: {
                $ne: userId
            }
        }).sort({ createdAt: -1 });
        console.log("getUser", getUser);

        // --------- first 64aee961671f9ca786fdce03 this user ----------

        function moveElementToFront(arr, userId) {
            const index = arr.findIndex((item) => item._id == userId);
            if (index > 0) {
                const element = arr.splice(index, 1)[0];
                arr.unshift(element);
            }
        }

        const targetUserId = "64aee961671f9ca786fdce03";
        moveElementToFront(getUser, targetUserId);

        // --------- first 64aee961671f9ca786fdce03 this user ----------

        const firstTenElements = getUser.slice(0, 10);

        if (firstTenElements.length == 0) {

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

            const responseArr = [];
            for (const userDetails of firstTenElements) {

                const findBlockUser = await Block.find({
                    user_id: userId,
                    block_user_id: userDetails._id
                });

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

                    // console.log("finalChatId::::", finalChatId);

                    const response = {
                        user_id: userDetails._id,
                        profile: userDetails.profile[0] ? userDetails.profile[0].res : "",
                        userName: userDetails.username,
                        email: userDetails.email,
                        phone: `${userDetails.country_code}${userDetails.phone_number}`,
                        chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                        vehicles: userDetails.vehicle
                    }
                    responseArr.push(response)

                }

            }

            res.status(status.OK).json(
                {
                    message: "Get User Detail Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: responseArr
                }
            )

        }

    } catch (error) {

        console.log("topTenUser--Error::", error);
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