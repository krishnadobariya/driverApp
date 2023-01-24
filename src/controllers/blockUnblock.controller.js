const BlockUnblock = require("../models/blockUnblock.model");
const status = require("http-status");

exports.blockUnblock = async (req, res) => {
    try {

        console.log("Data:::", req.params.user_id, req.params.block_user_id);

        if (req.body.block == 1) {

            const addBlockUnblock = BlockUnblock({
                user_id: req.params.user_id,
                block_user_id: req.params.block_user_id,
                block: req.body.block
            });
            const saveData = await addBlockUnblock.save();

            res.status(status.CREATED).json(
                {
                    message: "USER BLOCKED",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: saveData
                }
            )

        } else {

            const deleteData = await BlockUnblock.deleteOne({
                user_id: req.params.user_id,
                block_user_id: req.params.block_user_id
            });

            res.status(status.CREATED).json(
                {
                    message: "USER UNBLOCKED",
                    status: true,
                    code: 201,
                    statusCode: 1,
                    data: []
                }
            )

        }



    } catch (error) {

        console.log("error::", error);
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

exports.blockUnblockList = async (req, res) => {
    try {

        let userId = req.params.user_id;
        const findBlockList = await BlockUnblock.find({});

        res.status(status.OK).json(
            {
                message: "User is viewing his block details.",
                status: true,
                code: 200,
                statusCode: 1,
                data: findBlockList
            }
        )

    } catch (error) {

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