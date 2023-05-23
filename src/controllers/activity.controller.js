const Activity = require('../models/activity.model')
const status = require("http-status");
const authModel = require('../models/auth.model');
const cloudinary = require("../utils/cloudinary.utils");

//insert
exports.insert = async (req, res) => {
    try {

        const userData = await authModel.findOne({ _id: req.params.user_id })
        console.log("userData", userData);

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
                map_image: newPath.res,
                model: req.body.model
            });
            const saveData = await insertActivity.save();

            function increaseTimeDuration(initialTime, timeToAdd) {
                let initialTimeArray = initialTime.split(':'); // Split the initial time string into an array
                let seconds = parseInt(initialTimeArray[2]); // Get the seconds value
                let minutes = parseInt(initialTimeArray[1]); // Get the minutes value
                let hours = parseInt(initialTimeArray[0]); // Get the hours value

                let timeToAddArray = timeToAdd.split(':'); // Split the time to add string into an array
                seconds += parseInt(timeToAddArray[2]); // Add the seconds value
                minutes += parseInt(timeToAddArray[1]); // Add the minutes value
                hours += parseInt(timeToAddArray[0]); // Add the hours value

                minutes += Math.floor(seconds / 60); // Add the extra minutes when seconds exceed 60
                seconds %= 60; // Reset the seconds value to the remainder when divided by 60
                hours += Math.floor(minutes / 60); // Add the extra hours when minutes exceed 60
                minutes %= 60; // Reset the minutes value to the remainder when divided by 60

                let time = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'); // Format the time value with leading zeros
                return time; // Return the updated time value
            }

            for (const findVehical of userData.vehicle) {

                if (findVehical.vehicle_img_id == saveData.vehicle_id) {
                    console.log("findVehical", findVehical);

                    const updateData = await authModel.findOneAndUpdate({ "vehicle._id": findVehical._id },
                        {
                            $set: {
                                "vehicle.$.duration": increaseTimeDuration(findVehical.duration, req.body.duration),
                                "vehicle.$.distance": Math.round(parseFloat(findVehical.distance) + parseFloat(req.body.distance))
                            }
                        })

                }

            }

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