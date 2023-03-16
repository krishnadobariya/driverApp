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

        const myGroup = [];
        for (const respGroupData of groupData) {
            const response = {
                groupId: respGroupData._id,
                userId: respGroupData.user_id,
                groupImg: respGroupData.group_img,
                groupName: respGroupData.group_name,
                groupType: respGroupData.group_type,
                groupMembers: respGroupData.group_members
            }
            myGroup.push(response)
        }

        const joinGroup = [];
        for (const respGroupData of getData) {
            const response = {
                groupId: respGroupData.group_id,
                userId: respGroupData.user_id,
                groupImg: respGroupData.group_img,
                groupName: respGroupData.group_name,
                groupType: respGroupData.group_type,
                groupMembers: respGroupData.group_members
            }
            joinGroup.push(response)
        }

        const response = {
            myGroup: myGroup,
            joinGroup: joinGroup
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

exports.remainingList = async (req, res) => {
    try {

        let userId = req.params.userId;
        // jo e j user nu group hoy to ene list nathi apvanu, 10 g - 2 ma join and 2 banavela chhe 2 ma jon chavo te nai aave pan 2 tame banavel chhe te pan na ava joiye 
        // tame je userid aapo te mane male gropList mathi to e list pan nathi apvani
        const groupList = await Group.find({
            user_id: {
                $ne: userId
            }
        });
        const groupListData = await GroupList.find({
            user_id: userId
        });

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