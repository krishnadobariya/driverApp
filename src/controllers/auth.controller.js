const mongoose = require("mongoose");
const authModel = require("../models/auth.model");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const chatModel = require("../webSocket/models/chat.model");
const cloudinary = require("../utils/cloudinary.utils");
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
                profile: "https://res.cloudinary.com/tcloud/image/upload/v1672232275/yd0hfjeh13jtb511cf4p.jpg",
                username: req.body.username,
                email: req.body.email,
                country_code: req.body.country_code,
                phone_number: req.body.phone_number,
                age: req.body.age,
                gender: req.body.gender,
                password: req.body.password,
                fcm_token: req.body.fcm_token,
                vehicle: req.body.vehicle
            });
            const saveData = await authData.save();
            console.log("saveData:::", saveData);


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
                    age: getData[0].age,
                    sex: getData[0].sex,
                    vehicleType: getData[0].vehicleType,
                    vehicleSubType: getData[0].vehicleSubType,
                    dailyKM: getData[0].dailyKM,
                    email: getData[0].email,
                    number: getData[0].number,
                    password: getData[0].password,
                    model: getData[0].model ? getData[0].model : "",
                    year: getData[0].year ? getData[0].year : "",
                    trim: getData[0].trim,
                    fcm_token: getData[0].fcm_token ? getData[0].fcm_token : ""
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

exports.userList = async (req, res) => {
    try {

        let userId = req.params.id;
        let vehicleType = req.body.vehicle_type;
        let page = parseInt(req.query.page);
        let limit = parseInt(req.params.limit);

        // --- for pagination --- //
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // --- get user whithout user that id pass --- //

        const getUser = await authModel.find({
            _id: { $ne: userId }
        }).skip(startIndex).limit(endIndex).select('-__v');
        const vehicleDetails = [];

        for (const userDetails of getUser) {

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
            else {

            }

            for (const vehicleData of userDetails.vehicle) {

                if (vehicleData.vehicle_type == vehicleType) {
                    const response = {
                        profile: userDetails.profile,
                        userName: userDetails.username,
                        email: userDetails.email,
                        phone: `${userDetails.country_code}${userDetails.phone_number}`,
                        chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                        vehicleImageId: vehicleData.vehicle_img_id,
                        model: vehicleData.model,
                        type: vehicleData.vehicle_type,
                        year: vehicleData.year,
                        trim: vehicleData.trim,
                        dailyDriving: vehicleData.daily_driving,
                        unit: vehicleData.unit
                    }
                    vehicleDetails.push(response)
                }
            }
        }

        res.status(status.OK).json(
            {
                message: "Get User Detail Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: vehicleDetails
            }
        )


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


        res.status(status.OK).json(
            {
                message: "Get User Profile Data",
                status: true,
                code: 200,
                statusCode: 1,
                data: getUserData
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

exports.getUserInfo = async (req, res) => {
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
                latitude: userInfo.location.coordinates[1],
                longitude: userInfo.location.coordinates[0],

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

exports.userLogout = async (req, res, next) => {
    try {

        const findUser = await authModel.findOne({
            _id: req.params.id
        })

        if (findUser) {

            await authModel.deleteOne({
                _id: req.params.id
            })

            const findChatRoom = await chatRoomModel.find({
                $or: [{
                    user1: req.params.id
                }, {
                    user2: req.params.id
                }]
            })

            for (const roomId of findChatRoom) {
                await chatModel.deleteOne({
                    chatRoomId: roomId._id
                })
            }
            await chatRoomModel.deleteOne({
                user1: req.params.id
            })

            await chatRoomModel.deleteOne({
                user2: req.params.id
            })

            res.status(status.OK).json(
                {
                    message: "User Logout Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                }
            )


        } else {
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
                password: req.body.password
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

exports.userVehicleUpdateData = async (req, res) => {
    try {

        const updateVehicleData = await authModel.findOneAndUpdate({
            _id: req.params.id,
            "vehicle.vehicle_type": req.params.type
        }, {
            $set: {
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
