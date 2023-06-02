const status = require("http-status");
const User = require("../models/auth.model");
const InAppPurchase = require("../models/inAppPurchase.model")

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
            });
            const saveData = await insertInAppPurchase.save();

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
