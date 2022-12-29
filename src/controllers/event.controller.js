const Event = require("../models/event.model");
const authModel = require("../models/auth.model");
const joinEvent = require("../models/joinEvent.model");
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");

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
                    statusCode: 1
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
        console.log("vehicleType:;", req.body.vehicle_type);

        const getEventData = await Event.find({ vehicle_type: vehicleType }).skip(startIndex).limit(endIndex);
        console.log("getEventData::", getEventData);
        const eventDetails = [];
        for (const getUser of getEventData) {

            const getJoinUser = await joinEvent.find({ event_id: getUser._id }).count();
            const userIsJoin = await joinEvent.findOne({
                event_id: getUser._id,
                user_id: userId
            });
            console.log("eventId:;", getUser._id);
            console.log("userIds::", userId);
            console.log("userIsJoin::", userIsJoin);

            if (userIsJoin == null) {

                const response = {
                    user_id: getUser.user_id,
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
                    isJoin: false,
                    join_user: getJoinUser
                }
                eventDetails.push(response)

            } else {

                const response = {
                    user_id: getUser.user_id,
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