const GroupList = require("../models/groupList.model");
const Group = require("../models/group.model");
const GroupChat = require("../webSocket/models/groupChat.model");
const User = require("../models/auth.model");
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

            res.status(status.NOT_FOUND).json(
                {
                    message: "GroupList Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
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

        console.log("remainingList--Error::", error);
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

exports.groupListByChat = async (req, res) => {
    try {

        let userId = req.params.userId;
        const findUser = await User.findOne({ _id: userId });
        if (findUser == null) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "User Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            const findGroup = await GroupList.find({ user_id: userId });
            console.log("findGroup::", findGroup);

            const response = [];
            for (const respData of findGroup) {

                const findChats = await GroupChat.find({ groupId: respData.group_id });
                console.log("findChats::--:", findChats);
                for (const findChat of findChats) {

                    const chatMessage = findChat.chat;
                    const getLastMessage = chatMessage[chatMessage.length - 1];

                    var readCount = 0
                    var unReadCount = 0
                    for (const getReader of chatMessage) {

                        var readerCount = getReader.read;

                        var data = readerCount.find(function (ele) {
                            return ele.reader == userId;
                        });

                        if (data == undefined) {
                            unReadCount += 1
                        } else {
                            readCount += 1
                        }

                    }

                    const chatData = {
                        groupName: respData.group_name,
                        groupImage: respData.group_img,
                        unReadCount: unReadCount,
                        lastMsg: getLastMessage.message,
                        lastMsgUsername: getLastMessage.senderName,
                    }
                    response.push(chatData);

                }

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

        console.log("groupListByChat--Error::", error);
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