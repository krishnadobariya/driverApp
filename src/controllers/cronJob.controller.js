const status = require("http-status");
const User = require("../models/auth.model");

exports.userStatus = async (req, res) => {
    try {

        const presentTime = new Date().toISOString().slice(0, 19);
        const getUser = await User.find({ end_time: presentTime });
        
        const getNoti = await User.find({ notification_time: presentTime });
        // console.log("notification_time", getNoti[0].notification_time);

        console.log("getNoti",getNoti);

        for (const respData of getNoti) {
            // const userRoom = `User${respData._id}`;
            // io.to(userRoom).emit("notificationGet", "notificationGet");
        }

        for (const respData of getUser) {
            console.log("respData", respData);
            
            const updateStatus = await User.findByIdAndUpdate(
                {
                    _id: respData._id
                },
                {
                    $set: {
                        status: 'Offline'
                    }
                }
            );

        }

    } catch (error) {

        console.log("cronJob-userStatus-Error::", error);
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