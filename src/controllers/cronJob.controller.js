const status = require("http-status");
const User = require("../models/auth.model");
const MatchUsers = require("../models/matchUsers.model")
const Question = require("../models/userQuestion.model")
const Notification = require("../helper/firebaseHelper");

exports.userStatus = async (req, res) => {
    try {

        const presentTime = new Date().toISOString().slice(0, 19);
        const getUser = await User.find({ end_time: presentTime });

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

exports.matchesCron = async (req, res) => {
    try {

        const findUser = await MatchUsers.find()

        for (const findMatchUsers of findUser) {

            const findUserQuestion = await Question.findOne({ user_id: findMatchUsers.user_id })

            const findQuestionData = await Question.find({
                user_id: { $ne: findMatchUsers.user_id },
                que_one: findUserQuestion.que_one, que_two: findUserQuestion.que_two, que_three: findUserQuestion.que_three,
                que_four: findUserQuestion.que_four, que_five: findUserQuestion.que_five, que_six: findUserQuestion.que_six
            })

            var idArr = []
            for (const getId of findQuestionData) {
                idArr.push(getId.user_id)
            }
            console.log("id", idArr);

            const [field1 = null, field2 = null, field3 = null, field4 = null, field5 = null] = idArr;

            const updateData = await MatchUsers.findOneAndUpdate({ _id: findMatchUsers._id }, {
                user_id: findMatchUsers.user_id,
                match_id_one: field1,
                match_id_two: field2,
                match_id_three: field3,
                match_id_four: field4,
                match_id_five: field5
            })

            if (idArr.length < 5) {
                console.log("---", findMatchUsers.user_id);

                const title = "5 user match soon!";
                const body = "In 5 minutes";
                const text = "your 5 match user complete soon";
                const sendBy = "abc";
                // const registrationToken = findUserForNotiy.fcm_token
                // if (registrationToken != null) {
                    console.log("--------");
                    Notification.sendPushNotificationFCM(
                        // registrationToken,
                        title,
                        body,
                        text,
                        sendBy,
                        true
                    );
                // } 

            }

        }


    } catch (error) {

        console.log("cronJob-matches-Error::", error);

    }
}