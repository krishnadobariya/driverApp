const Event = require("../models/event.model");
const authModel = require("../models/auth.model");
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
        console.log("getUserData::", getUserData.profile);

        const insertEventData = Event({
            user_id: getUserData._id,
            username: getUserData.username,
            user_profile: getUserData.profile,
            event_photo: urls,
            name: req.body.name,
            date: req.body.date,
            time: req.body.time,
            address: req.body.address,
            about: req.body.about
        });
        const saveData = await insertEventData.save();

        res.status(status.CREATED).json(
            {
                message: "Insert Event Data Successfully",
                status: true,
                code: 201,
                statusCode: 1,
                data: saveData
            }
        )

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