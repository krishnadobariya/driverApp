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

            const findUserQuestion = await Question.findOne({
                user_id: findMatchUsers.user_id,
            });
            const findQuestionData = await Question.find({
                user_id: { $ne: findMatchUsers.user_id },
                que_one: findUserQuestion.que_one,
                que_two: findUserQuestion.que_two,
                que_three: findUserQuestion.que_three,
                que_four: findUserQuestion.que_four,
                que_five: findUserQuestion.que_five,
                que_six: findUserQuestion.que_six,
            }).select("user_id -_id");
            // console.log("findQuestionData", findQuestionData);

            const idArr = []
            for (const getIds of findQuestionData) {
                idArr.push(getIds.user_id)
            }
            // console.log("idArr", idArr);

            const findMatchUser = await MatchUsers.find({ user_id: findMatchUsers.user_id })

            var saveMatchCount = parseInt(0);
            // console.log('saveMatchCount:---:', saveMatchCount);
            for (const checkMatches of findMatchUser) {

                if (checkMatches.credit == checkMatches.match_count) {

                    saveMatchCount += parseInt(checkMatches.credit)
                    // console.log("saveMatchCount----", `${checkMatches.credit}`, saveMatchCount);

                } else {

                    let matchIds = [];
                    if (checkMatches.credit == 5) {
                        // console.log("parseInt(saveMatchCount)----------", saveMatchCount);
                        matchIds = findQuestionData.slice(saveMatchCount, saveMatchCount + 5).map((getId) => getId.user_id);
                        saveMatchCount += parseInt(checkMatches.credit)
                    } else if (checkMatches.credit == 15) {
                        matchIds = findQuestionData.slice(saveMatchCount, saveMatchCount + 15).map((getId) => getId.user_id);
                        saveMatchCount += parseInt(checkMatches.credit)
                    } else {
                        matchIds = findQuestionData.slice(saveMatchCount, saveMatchCount + 20).map((getId) => getId.user_id);
                        saveMatchCount += parseInt(checkMatches.credit)
                    }

                    const updateData = await MatchUsers.findOneAndUpdate(
                        {
                            _id: checkMatches._id
                        },
                        {
                            match_user: matchIds,
                            match_count: matchIds.length
                        }
                    )

                    // console.log("matchIds", matchIds); 

                }

            }

        }


    } catch (error) {

        console.log("cronJob-matches-Error::", error);

    }
}