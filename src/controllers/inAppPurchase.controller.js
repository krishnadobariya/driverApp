const status = require("http-status");
const User = require("../models/auth.model");
const InAppPurchase = require("../models/inAppPurchase.model");
const MatchUsers = require("../models/matchUsers.model")
const Question = require("../models/userQuestion.model")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


exports.insertInAppPurchase = async (req, res) => {
    try {

        const findUser = await User.findOne({ _id: req.params.user_id });

        if (findUser === null) {
            res.status(status.NOT_FOUND).json({
                message: "User Not Found",
                status: true,
                code: 404,
                statusCode: 1,
            });
        } else {

            const insertInAppPurchase = new InAppPurchase({
                user_id: req.params.user_id,
                orderId: req.body.orderId,
                phone_type: req.body.phone_type,
                purchaseTime: req.body.purchaseTime,
                purchaseToken: req.body.purchaseToken,
                credit: req.body.credit,
                subscription_type: req.body.subscription_type,
            });
            const saveData = await insertInAppPurchase.save();

            if (saveData.subscription_type == 2) {

                const findUserQuestion = await Question.findOne({
                    user_id: saveData.user_id,
                });
                const findQuestionData = await Question.find({
                    user_id: { $ne: saveData.user_id },
                    que_one: findUserQuestion.que_one,
                    que_two: findUserQuestion.que_two,
                    que_three: findUserQuestion.que_three,
                    que_four: findUserQuestion.que_four,
                    que_five: findUserQuestion.que_five,
                    que_six: findUserQuestion.que_six,
                }).select("user_id -_id");
                console.log("findQuestionData", findQuestionData);

                const idArr = []
                for (const getIds of findQuestionData) {
                    idArr.push(getIds.user_id)
                }
                console.log("idArr", idArr);

                const findMatchUser = await MatchUsers.find({ user_id: req.params.user_id })

                var saveMatchCount = parseInt(0);
                console.log('saveMatchCount:---:', saveMatchCount);
                for (const checkMatches of findMatchUser) {

                    if (checkMatches.credit == checkMatches.match_count) {

                        saveMatchCount += parseInt(checkMatches.credit)
                        console.log("saveMatchCount----", `${checkMatches.credit}`, saveMatchCount);

                    } else {

                        let matchIds = [];
                        if (checkMatches.credit == 5) {
                            console.log("parseInt(saveMatchCount)----------", saveMatchCount);
                            matchIds = findQuestionData.slice(saveMatchCount, saveMatchCount + 5).map((getId) => getId.user_id);
                            saveMatchCount += parseInt(checkMatches.credit)
                        } else if (checkMatches.credit == 15) {
                            matchIds = findQuestionData.slice(saveMatchCount, saveMatchCount + 15).map((getId) => getId.user_id);
                            saveMatchCount += parseInt(checkMatches.credit)
                        } else {
                            matchIds = findQuestionData.slice(saveMatchCount, saveMatchCount + 20).map((getId) => getId.user_id);
                            saveMatchCount += parseInt(checkMatches.credit)
                        }

                        console.log("matchIds", matchIds);

                        const updateData = await MatchUsers.findOneAndUpdate(
                            {
                                _id: checkMatches._id
                            },
                            {
                                match_user: matchIds,
                                match_count: matchIds.length
                            }
                        )

                        console.log("matchIds", matchIds);

                    }

                }

                const saveIds = idArr.slice(saveMatchCount, saveMatchCount + parseInt(saveData.credit))
                console.log("saveIds::----->>>>", saveIds);

                const insertMatchUser = new MatchUsers({
                    user_id: req.params.user_id,
                    match_user: saveIds,
                    credit: req.body.credit,
                    match_count: saveIds.length
                });
                console.log("insertMatchUser", insertMatchUser);
                const saveMatchUserData = await insertMatchUser.save();
                console.log("saveMatchUserData::--->>>.", saveMatchUserData);

                res.status(status.CREATED).json({
                    message: "inAppPurchase Insert Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: saveData,
                });

            }

        }

    } catch (error) {
        console.log("insertInAppPurchase-Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "Something Went Wrong",
            status: false,
            code: 500,
            statusCode: 0,
            error: error.message,
        });
    }
}