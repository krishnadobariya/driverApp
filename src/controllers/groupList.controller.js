const GroupList = require("../models/groupList.model");
const Group = require("../models/group.model");
const status = require("http-status");


exports.joinList = async (req, res) => {
    try {

        let userId = req.params.userId;
        const getData = await GroupList.find({ user_id: userId });

        if (getData.length == 0) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            res.status(status.OK).json(
                {
                    message: "Group List View Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: getData
                }
            )

        }

    } catch (error) {

        console.log("joinList--Error::", error);
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

exports.remainingList = async (req, res) => {
    try {

        let userId = req.params.userId;
        const findGroupListDatas = await GroupList.find({
            user_id: userId
        });

        if (findGroupListDatas.length == 0) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Data Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const response = [];
            for (const findGroupListData of findGroupListDatas) {
                const remainingGroup = await Group.findOne({
                    _id: {
                        $ne: findGroupListData.group_id
                    }
                })
                response.push(remainingGroup)
            }

            res.status(status.OK).json(
                {
                    message: "REMAINING GROUP LIST",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: response
                }
            )

        }

    } catch (error) {

        console.log("notJoinList--Error::", error);
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
