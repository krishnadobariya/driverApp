const mongoose = require("mongoose");
const authModel = require("../models/auth.model");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const chatModel = require("../webSocket/models/chat.model");
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
                    res: "https://res.cloudinary.com/tcloud/image/upload/v1672232275/yd0hfjeh13jtb511cf4p.jpg"
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
                longitude: saveData.location.coordinates[0],
                latitude: saveData.location.coordinates[1],
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
        }).skip(startIndex).limit(endIndex).select('-__v').sort({ createdAt: -1 });
        console.log("getUser::", getUser);

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
                    profile: userDetails.profile,
                    userName: userDetails.username,
                    email: userDetails.email,
                    phone: `${userDetails.country_code}${userDetails.phone_number}`,
                    chatRoomId: finalChatId[0] ? finalChatId[0]._id : "",
                    vehicles: arrVehicleData
                }
                vehicleDetails.push(response)
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
        console.log("userProfile:::", getUserData);

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

            const response = {
                user_id: getUserData._id,
                profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
                username: getUserData.username,
                email: getUserData.email,
                country_code: getUserData.country_code,
                phone_number: getUserData.phone_number,
                age: getUserData.age,
                gender: getUserData.gender,
                password: getUserData.password,
                fcm_token: getUserData.fcm_token,
                longitude: getUserData.location.coordinates[0],
                latitude: getUserData.location.coordinates[1],
                vehicle: getUserData.vehicle
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
        }).then((resp) => {
            console.log("Res:;", resp);
            res.status(status.OK).json(
                {
                    message: "User Detail Update Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1
                }
            )
        }).catch((err) => {
            res.status(status.ACCEPTED).json(
                {
                    message: "Image Not Uploaded",
                    status: false,
                    code: 500,
                    statusCode: 0,
                    error: err.message
                }
            )
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
