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

            if (findMatchUsers.credit == 5) {

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
                    match_id_five: field5,
                    credit: findMatchUsers.credit
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

            } else if (findMatchUsers.credit == 15) {

                var idArr = []
                for (const getId of findQuestionData) {
                    idArr.push(getId.user_id)
                }
                console.log("id", idArr);

                const [field1 = null, field2 = null, field3 = null, field4 = null, field5 = null, field6 = null, field7 = null, field8 = null, field9 = null, field10 = null, field11 = null, field12 = null, field13 = null, field14 = null, field15 = null] = idArr;

                const updateData = await MatchUsers.findOneAndUpdate({ _id: findMatchUsers._id }, {
                    user_id: findMatchUsers.user_id,
                    match_id_one: field1,
                    match_id_two: field2,
                    match_id_three: field3,
                    match_id_four: field4,
                    match_id_five: field5,
                    match_id_six: field6,
                    match_id_seven: field7,
                    match_id_eight: field8,
                    match_id_nine: field9,
                    match_id_ten: field10,
                    match_id_eleven: field11,
                    match_id_twelve: field12,
                    match_id_thirteen: field13,
                    match_id_fourteen: field14,
                    match_id_fifteen: field15,
                    credit: findMatchUsers.credit
                })

                if (idArr.length < 15) {
                    console.log("---", findMatchUsers.user_id);

                    const title = "15 user match soon!";
                    const body = "In 5 minutes";
                    const text = "your 15 match user complete soon";
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

            } else {

                var idArr = []
                for (const getId of findQuestionData) {
                    idArr.push(getId.user_id)
                }
                console.log("id", idArr);

                const [field1 = null, field2 = null, field3 = null, field4 = null, field5 = null, field6 = null, field7 = null, field8 = null, field9 = null, field10 = null, field11 = null, field12 = null, field13 = null, field14 = null, field15 = null, field16 = null, field17 = null, field18 = null, field19 = null, field20 = null] = idArr;

                const updateData = await MatchUsers.findOneAndUpdate({ _id: findMatchUsers._id }, {
                    user_id: findMatchUsers.user_id,
                    match_id_one: field1,
                    match_id_two: field2,
                    match_id_three: field3,
                    match_id_four: field4,
                    match_id_five: field5,
                    match_id_six: field6,
                    match_id_seven: field7,
                    match_id_eight: field8,
                    match_id_nine: field9,
                    match_id_ten: field10,
                    match_id_eleven: field11,
                    match_id_twelve: field12,
                    match_id_thirteen: field13,
                    match_id_fourteen: field14,
                    match_id_fifteen: field15,
                    match_id_sixteen: field16,
                    match_id_seventeen: field17,
                    match_id_eighteen: field18,
                    match_id_nineteen: field19,
                    match_id_twenty: field20,
                    credit: findMatchUsers.credit
                })

                if (idArr.length < 20) {
                    console.log("---", findMatchUsers.user_id);

                    const title = "20 user match soon!";
                    const body = "In 5 minutes";
                    const text = "your 20 match user complete soon";
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

        }


    } catch (error) {

        console.log("cronJob-matches-Error::", error);

    }
}