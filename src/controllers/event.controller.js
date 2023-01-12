const Event = require("../models/event.model");
const authModel = require("../models/auth.model");
const joinEvent = require("../models/joinEvent.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");
// const ObjectId = mongoose.Types.ObjectId;


exports.addEvent = async (req, res) => {
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

        let userId = req.params.id;
        const getUserData = await authModel.findOne({ _id: userId });
        console.log("getUserData::", getUserData);

        if (getUserData == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: true,
                    code: 404,
                    statusCode: 1,
                    data: []
                }
            )

        } else {

            const insertEventData = Event({
                user_id: getUserData._id,
                username: getUserData.username,
                user_profile: getUserData.profile,
                event_photo: urls,
                name: req.body.name,
                date: req.body.date,
                time: req.body.time,
                vehicle_type: req.body.vehicle_type,
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(req.body.longitude),
                        parseFloat(req.body.latitude),
                    ],
                },
                address: req.body.address,
                about: req.body.about
            });
            const saveData = await insertEventData.save();

            const response = {
                user_id: saveData.user_id,
                username: saveData.username,
                user_profile: saveData.user_profile[0] ? saveData.user_profile[0].res : "",
                event_photo: saveData.event_photo[0] ? saveData.event_photo[0].res : "",
                name: saveData.name,
                date: saveData.date,
                time: saveData.time,
                vehicle_type: saveData.vehicle_type,
                longitude: saveData.location.coordinates[0],
                latitude: saveData.location.coordinates[1],
                address: saveData.address,
                about: saveData.about
            }

            res.status(status.CREATED).json(
                {
                    message: "Insert Event Data Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: response
                }
            )

        }



    } catch (error) {
        console.log("addEvent-Error::", error);
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

exports.eventList = async (req, res) => {
    try {

        // --- For Pagination Portion --- //
        let page = parseInt(req.query.page);
        let size = parseInt(req.query.size);

        const startIndex = (page - 1) * size;
        const endIndex = page * size;

        let vehicleType = req.body.vehicle_type;
        let userId = req.params.user_id;
        // console.log("vehicleType:;", req.body.vehicle_type);

        const getEventData = await Event.find({
            user_id: {
                $ne: userId
            },
            vehicle_type: vehicleType
        }).skip(startIndex).limit(endIndex).sort({ createdAt: -1 });
        console.log("getEventData::", getEventData);

        if (getEventData.length == 0) {
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

            const eventDetails = [];
            for (const getUser of getEventData) {

                const getJoinUser = await joinEvent.find({ event_id: getUser._id }).count();
                const userIsJoin = await joinEvent.findOne({
                    user_id: userId,
                    event_id: getUser._id,
                }).sort({ createdAt: -1 });

                console.log("userId::", userId);
                console.log("eventId::", getUser._id);

                console.log("userIsJoin:---------", userIsJoin);
                // console.log("getUser:----------", getUser);

                if (userIsJoin == null) {

                    const response = {
                        user_id: getUser.user_id,
                        event_id: getUser._id,
                        username: getUser.username,
                        user_profile: getUser.user_profile[0] ? getUser.user_profile[0].res : "",
                        event_photo: getUser.event_photo[0] ? getUser.event_photo[0].res : "",
                        name: getUser.name,
                        date: getUser.date,
                        time: getUser.time,
                        vehicle_type: getUser.vehicle_type,
                        longitude: getUser.location.coordinates[0],
                        latitude: getUser.location.coordinates[1],
                        address: getUser.address,
                        about: getUser.about,
                        isJoin: false,
                        join_user: getJoinUser
                    }
                    eventDetails.push(response)

                } else {

                    const response = {
                        user_id: getUser.user_id,
                        event_id: getUser._id,
                        username: getUser.username,
                        user_profile: getUser.user_profile[0] ? getUser.user_profile[0].res : "",
                        event_photo: getUser.event_photo[0] ? getUser.event_photo[0].res : "",
                        name: getUser.name,
                        date: getUser.data,
                        time: getUser.time,
                        vehicle_type: getUser.vehicle_type,
                        longitude: getUser.location.coordinates[0],
                        latitude: getUser.location.coordinates[1],
                        address: getUser.address,
                        about: getUser.about,
                        isJoin: true,
                        join_user: getJoinUser
                    }
                    eventDetails.push(response)

                }

            }

            res.status(status.OK).json(
                {
                    message: "Get All Event Detail Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: eventDetails
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

exports.eventAttendees = async (req, res) => {
    try {

        let event_id = req.params.id;
        console.log("event_id::", event_id);

        const findEvent = await joinEvent.find({
            event_id: event_id
        });
        console.log("findEvent::", findEvent);

        if (findEvent.length == 0) {

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
            for (const getUser of findEvent) {

                const findUserDetails = await authModel.findOne({
                    _id: getUser.user_id
                });

                const usrData = {
                    user_id: getUser.user_id,
                    profile: findUserDetails.profile[0] ? findUserDetails.profile[0].res : "",
                    username: findUserDetails.username,
                    age: findUserDetails.age,
                    gender: findUserDetails.gender
                }

                response.push(usrData)

            }

            res.status(status.OK).json(
                {
                    message: "Get All Event's User Details  Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
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

exports.myEvent = async (req, res) => {
    try {

        let userId = req.params.user_id;
        let vehicleType = req.body.vehicle_type;

        const getMyEvent = await Event.find({
            user_id: userId,
            vehicle_type: vehicleType
        });

        if (getMyEvent.length == 0) {
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
            for (const respSet of getMyEvent) {

                const getJoinUser = await joinEvent.find({ event_id: respSet._id }).count();

                const eventData = {
                    event_id: respSet._id,
                    user_id: respSet.user_id,
                    username: respSet.username,
                    user_profile: respSet.user_profile[0] ? respSet.user_profile[0].res : "",
                    event_photo: respSet.event_photo[0] ? respSet.event_photo[0].res : "",
                    name: respSet.name,
                    date: respSet.date,
                    time: respSet.time,
                    vehicle_type: respSet.vehicle_type,
                    longitude: respSet.location.coordinates[0],
                    latitude: respSet.location.coordinates[1],
                    address: respSet.address,
                    about: respSet.about,
                    isJoin: true,
                    join_user: getJoinUser
                }
                response.push(eventData)

            }

            res.status(status.OK).json(
                {
                    message: "GET MY ALL EVENT LIST SUCCESSFULLY",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
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

exports.deleteEvent = async (req, res) => {
    try {

        const eventId = req.params.event_id;

        const deleteEventData = await Event.deleteOne({
            _id: eventId
        });

        res.status(status.OK).json(
            {
                message: "Event Delete Successfully",
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