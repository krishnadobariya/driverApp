const authModel = require("../models/auth.model");
const chatRoom = require("../webSocket/models/chatRoom.model")
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");
const mongoose = require("mongoose");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const chatModel = require("../webSocket/models/chat.model");
const objectId = mongoose.Schema.Types.ObjectId;

exports.registration = async (req, res) => {
    try {

        let email = req.body.email;

        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, (err, res) => {
                    console.log("file", file);
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
        console.log("req.files::::", req.files);

        for (const file of files) {
            const { path } = file
            console.log("path::", path);

            const newPath = await cloudinaryImageUploadMethod(path)
            console.log("newPath::", newPath);
            urls.push(newPath)
        }

        const getData = await authModel.find({ email: email });

        if (getData.length == 0) {
            const authData = authModel({
                profile: urls,
                username: req.body.username,
                age: req.body.age,
                sex: req.body.sex,
                vehicleType: req.body.vehicleType,
                vehicleSubType: req.body.vehicleSubType,
                dailyKM: req.body.dailyKM,
                email: email,
                number: req.body.number,
                password: req.body.password,
                model : req.body.model,
                year : req.body.year,
                trim : req.body.trim ? req.body.trim : 0,
                fcm_token : req.body.fcm_token
            });

            const saveData = await authData.save();
            console.log("saveData", saveData.profile[0].res);

            const response = {
                user_id: saveData._id,
                profile: saveData.profile[0].res,
                username: saveData.username,
                age: saveData.age,
                sex: saveData.sex,
                vehicleType: saveData.vehicleType,
                vehicleSubType: saveData.vehicleSubType,
                dailyKM: saveData.dailyKM,
                email: saveData.email,
                number: saveData.number,
                password: saveData.password,
                model : saveData.model,
                year : saveData.year,
                trim : saveData.trim
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
                    $set : {
                        fcm_token : req.body.fcm_token
                    }
                })
                const getData = await authModel.find({ email: email });

                const response = {
                    user_id: getData[0]._id,
                    profile: getData[0].profile[0].res,
                    username: getData[0].username,
                    age: getData[0].age,
                    sex: getData[0].sex,
                    vehicleType: getData[0].vehicleType,
                    vehicleSubType: getData[0].vehicleSubType,
                    dailyKM: getData[0].dailyKM,
                    email: getData[0].email,
                    number: getData[0].number,
                    password: getData[0].password,
                    model : getData[0].model ? getData[0].model : "",
                    year : getData[0].year ? getData[0].year : "",
                    trim : getData[0].trim,
                    fcm_token : getData[0].fcm_token ? getData[0].fcm_token  :""
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

exports.all_user = async (req, res) => {
    try {

        let userId = req.body.user_id;
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const getAllData = await authModel.find({ _id : {$ne : userId}, vehicleType: req.body.vehicle_type }).sort(up).skip(startIndex).limit(endIndex).select('-__v');

        console.log("getAllData", getAllData);
        const chatRoomId = [];
        for (const getChatRoomId of getAllData) {

            var finalChatId = "";
            finalChatId = await chatRoom.find(
                {
                    user1: getChatRoomId._id,
                    user2: userId,
                }
            );


            if (finalChatId.length == 0) {
                finalChatId = await chatRoom.find(
                    {
                        user2: getChatRoomId._id,
                        user1: userId,
                    }
                );

            }
            else {

            }
            const response = {
                _id: getChatRoomId._id,
                chatRoom: finalChatId[0] ? finalChatId[0]._id : "",
                profile: getChatRoomId.profile,
                username: getChatRoomId.username,
                age: getChatRoomId.age,
                sex: getChatRoomId.sex,
                vehicleType: getChatRoomId.vehicleType,
                vehicleSubType: getChatRoomId.vehicleSubType,
                dailyKM: getChatRoomId.dailyKM,
                email: getChatRoomId.email,
                number: getChatRoomId.number,
                password: getChatRoomId.password,
                model : getChatRoomId.model ? getChatRoomId.model  : "",
                year : getChatRoomId.year ? getChatRoomId.year : "",
                trim : getChatRoomId.trim
                
            }
            chatRoomId.push(response)


            // const findChatRoom = await chatRoom.find(
            //     {
            //         $or: [
            //             {
            //                 user1: userId
            //             },
            //             {
            //                 user2: userId
            //             }
            //         ]
            //     }
            // );



            // console.log("findChatRoom::",findChatRoom);

            // for (const chatRoomIdData of findChatRoom) {
            //     console.log("chatRoomIdData::", chatRoomIdData);
            // }



            /*if (userId == getChatRoomId._id) {

                const response = {
                    _id: getChatRoomId._id,
                    chatRoom: finalChatId._id,
                    profile: getChatRoomId.profile,
                    username: getChatRoomId.username,
                    age: getChatRoomId.age,
                    sex: getChatRoomId.sex,
                    vehicleType: getChatRoomId.vehicleType,
                    dailyKM: getChatRoomId.dailyKM,
                    email: getChatRoomId.email,
                    number: getChatRoomId.number,
                    password: getChatRoomId.password
                }
                chatRoomId.push(response)

            } else {

                const response = {
                    _id: getChatRoomId._id,
                    chatRoom: "",
                    profile: getChatRoomId.profile,
                    username: getChatRoomId.username,
                    age: getChatRoomId.age,
                    sex: getChatRoomId.sex,
                    vehicleType: getChatRoomId.vehicleType,
                    dailyKM: getChatRoomId.dailyKM,
                    email: getChatRoomId.email,
                    number: getChatRoomId.number,
                    password: getChatRoomId.password
                }
                chatRoomId.push(response)

            }*/

        }

        res.status(status.OK).json(
            {
                message: "Get User Detail Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: chatRoomId
            }
        )

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

exports.viewById = async (req, res) => {
    try {

        const findUserById = await authModel.findById(
            {
                _id: req.params.id
            }
        ).select('-__v');

        res.status(status.OK).json(
            {
                message: "User Login Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: findUserById
            }
        )

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

exports.getUserInfo = async(req,res) => {
    try {

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const getAllData = await authModel.find().skip(startIndex).limit(endIndex).select('-__v');

        const userInfoList = [];
        for (const userInfo of getAllData) {

        
            const response = {
                _id: userInfo._id,
                profile: userInfo.profile,
                username: userInfo.username,
               latitude:userInfo.location.coordinates[1],
               longitude:userInfo.location.coordinates[0],

            }
            userInfoList.push(response)


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

exports.userLogout = async(req,res,next) => {
try {

    const findUser = await authModel.findOne({
        _id : req.params.id
    })

    if(findUser){

        await authModel.deleteOne({
            _id : req.params.id
        })

        const findChatRoom = await chatRoomModel.find({
            $or : [{
                user1 : req.params.id
            }, {
                user2 : req.params.id
            }]
        })

        for(const roomId of findChatRoom){
            await chatModel.deleteOne({
                chatRoomId : roomId._id
            })
        }
        await chatRoomModel.deleteOne({
            user1 : req.params.id
        })

        await chatRoomModel.deleteOne({
            user2 : req.params.id
        })

        res.status(status.OK).json(
            {
                message: "User Logout Successfully",
                status: true,
                code: 200,
                statusCode: 1,
            }
        )


    }else{
        res.status(status.NOT_FOUND).json(
            {
                message: "User Not Found",
                status: true,
                code: 404,
                statusCode: 1
            }
        )
    }
    
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
