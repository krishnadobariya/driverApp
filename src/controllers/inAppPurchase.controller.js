const status = require("http-status");
const User = require("../models/auth.model");
const InAppPurchase = require("../models/inAppPurchase.model");
const MatchUsers = require("../models/matchUsers.model")
const Question = require("../models/userQuestion.model")

exports.insertInAppPurchase = async (req, res) => {
    try {

        const findUser = await User.findOne({ _id: req.params.user_id })

        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Found",
                    status: true,
                    code: 404,
                    statusCode: 1
                }
            )

        } else {

            const insertInAppPurchase = new InAppPurchase({
                user_id: req.params.user_id,
                orderId: req.body.orderId,
                phone_type: req.body.phone_type,
                purchaseTime: req.body.purchaseTime,
                purchaseToken: req.body.purchaseToken,
                credit: req.body.credit,
                subscription_type: req.body.subscription_type
            });
            const saveData = await insertInAppPurchase.save();

            if (saveData.subscription_type == 2) {

                const findUserQuestion = await Question.findOne({ user_id: req.params.user_id })

                const findQuestionData = await Question.find({
                    user_id: { $ne: req.params.user_id },
                    que_one: findUserQuestion.que_one, que_two: findUserQuestion.que_two, que_three: findUserQuestion.que_three, que_four: findUserQuestion.que_four, que_five: findUserQuestion.que_five, que_six: findUserQuestion.que_six
                })

                var idArr = []
                if (saveData.credit == 5) {

                    for (const getId of findQuestionData) {
                        idArr.push(getId.user_id)
                    }
                    console.log("id", idArr);

                    const [field1 = null, field2 = null, field3 = null, field4 = null, field5 = null] = idArr;

                    const insertmatchUsers = new MatchUsers({
                        user_id: req.params.user_id,
                        match_id_one: field1,
                        match_id_two: field2,
                        match_id_three: field3,
                        match_id_four: field4,
                        match_id_five: field5,
                        credit: req.body.credit
                    });
                    const saveMatchesData = await insertmatchUsers.save();

                } else if(saveData.credit == 15) {
                    
                    for (const getId of findQuestionData) {
                        idArr.push(getId.user_id)
                    }
                    console.log("id", idArr);

                    const [field1 = null, field2 = null, field3 = null, field4 = null, field5 = null, field6 = null, field7 = null, field8 = null, field9 = null, field10 = null, field11 = null, field12 = null, field13 = null, field14 = null, field15 = null] = idArr;

                    const insertmatchUsers = new MatchUsers({
                        user_id: req.params.user_id,
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
                        credit: req.body.credit
                    });
                    const saveMatchesData = await insertmatchUsers.save();

                } else {

                    for (const getId of findQuestionData) {
                        idArr.push(getId.user_id)
                    }
                    console.log("id", idArr);

                    const [field1 = null, field2 = null, field3 = null, field4 = null, field5 = null, field6 = null, field7 = null, field8 = null, field9 = null, field10 = null, field11 = null, field12 = null, field13 = null, field14 = null, field15 = null, field16 = null, field17 = null, field18 = null, field19 = null, field20 = null] = idArr;

                    const insertmatchUsers = new MatchUsers({
                        user_id: req.params.user_id,
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
                        credit: req.body.credit
                    });
                    const saveMatchesData = await insertmatchUsers.save();

                }

            }

            res.status(status.CREATED).json(
                {
                    message: "inAppPurchase Insert Successfully",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: saveData
                }
            )

        }

    } catch (error) {

        console.log("insertInAppPurchase-Error::", error);
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
