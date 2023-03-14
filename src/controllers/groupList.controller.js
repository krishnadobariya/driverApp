const GroupList = require("../models/groupList.model");
const Group = require("../models/group.model");
const status = require("http-status");


exports.joinList = async (req, res) => {
    try {

        let userId = req.params.userId;
        const groupData = await Group.find({ user_id: userId });
        const getData = await GroupList.find({ user_id: userId });

        /*
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

            if (groupData.length == 0) {

                res.status(status.NOT_FOUND).json(
                    {
                        message: "Group Not Exist",
                        status: false,
                        code: 404,
                        statusCode: 0
                    }
                )

            } else {

                

            }

        }
        */

        const response = {
            myGroup: groupData,
            joinGroup: getData
        }

        res.status(status.OK).json(
            {
                message: "Group List View Successfully",
                status: true,
                code: 200,
                statusCode: 1,
                data: response
            }
        )

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

/*
- Groups
    a b c d

- GroupList
    a 

- joinList ma jetla ma join chhe e list apvanu
- remainingList ma jetla ma join thavanu baki chhe e list apvanu chhe
*/

exports.remainingList = async (req, res) => {
    try {

        let userId = req.params.userId;

        const groupList = await Group.find();
        const groupListData = await GroupList.find({ user_id: userId });
        console.log("groupListData::", groupListData);
        if (groupListData.length == 0) {

            res.status(status.OK).json(
                {
                    message: "REMAINING GROUP LIST",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: groupList
                }
            )

        } else {

            var remainingData = groupList.filter(function (data) {
                return !groupListData.some(function (o2) {
                    return (data._id).toString() == (o2.group_id).toString();
                });
            });

            res.status(status.OK).json(
                {
                    message: "REMAINING GROUP LIST",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: remainingData
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
