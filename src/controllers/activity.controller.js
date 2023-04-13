const Activity = require('../models/activity.model')
const status = require("http-status");
const authModel = require('../models/auth.model');
const cloudinary = require("../utils/cloudinary.utils");

//insert
exports.insert = async (req, res) => {
    try {

        const userData = await authModel.findOne({ _id: req.params.user_id })
        if (userData == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Found",
                    status: true,
                    code: 404,
                    statusCode: 1
                }
            )

        } else {

            const cloudinaryImageUploadMethod = async file => {
                return new Promise(resolve => {
                    cloudinary.uploader.upload(file, (err, res) => {
                        if (err) return err
                        resolve({
                            res: res.secure_url
                        })
                    })
                })
            }

            const file = req.file;
            const { path } = file;
            const newPath = await cloudinaryImageUploadMethod(path);

            const insertActivity = new Activity({
                user_id: req.params.user_id,
                activity_type: req.body.activity_type,
                duration: req.body.duration,
                distance: req.body.distance,
                calories: req.body.calories,
                steps: req.body.steps,
                date: req.body.date,
                time: req.body.time,
                vehicle_id: req.body.vehicle_id,
                map_image: newPath.res
            });
            const saveData = await insertActivity.save();

            res.status(status.CREATED).json(
                {
                    message: "Activity Insert Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: saveData
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