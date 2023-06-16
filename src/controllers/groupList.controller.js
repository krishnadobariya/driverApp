const GroupList = require("../models/groupList.model");
const Group = require("../models/group.model");
const GroupChat = require("../webSocket/models/groupChat.model");
const GroupPostLike = require("../models/groupPostLike.model");
const GroupMemberList = require("../models/groupMemberList.model");
const GroupChatRoom = require("../webSocket/models/groupChatRoom.model");
const Notification = require("../models/notification.model");
const User = require("../models/auth.model");
const status = require("http-status");


exports.joinList = async (req, res) => {
    try {

        let userId = req.params.userId;
        const groupData = await Group.find({ user_id: userId }).sort({ createdAt: -1 });
        const getData = await GroupList.find({ user_id: userId }).sort({ createdAt: -1 });

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

        const groupList = await Group.find({
            user_id: {
                $ne: userId
            }
        }).sort({ createdAt: -1 });
        // console.log("groupList::--", groupList);

        const groupListData = await GroupList.find({
            user_id: userId
        }).sort({ createdAt: -1 });
        // console.log("groupListData:::", groupListData);

        // var remainingData = groupList.filter(function (data) {
        //     return !groupListData.some(function (o2) {
        //         return (data._id).toString() == (o2.group_id).toString();
        //     });
        // });


        // if (groupListData.length == 0) {

        //     res.status(status.NOT_FOUND).json(
        //         {
        //             message: "GroupList Not Exist",
        //             status: false,
        //             code: 404,
        //             statusCode: 0
        //         }
        //     )

        // } else {

        var remainingData = groupList.filter(function (data) {
            // console.log("data::", data);
            return !groupListData.some(function (o2) {
                // console.log("o2:", o2);
                return (data._id).toString() == (o2.group_id).toString();
            });
        });
        console.log("remainingData::", remainingData);
        const response = [];
        for (const respData of remainingData) {

            // if (condition) {

            // }

            const getNotiData = await Notification.findOne({
                group_id: respData._id,
                user_id: userId,
                notification_type: 1
            })
            console.log("getNotiData::", getNotiData);


            if (getNotiData == null) {
                const getNotificationData = await Notification.findOne({
                    group_id: respData._id,
                    req_user_id: userId,
                    notification_type: 2
                })
                console.log("getNotificationData::", getNotificationData);

                if (getNotificationData == null) {
                    response.push(respData);
                }
            }

        }
        console.log("response", response);

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        res.status(status.OK).json(
            {
                message: "REMAINING GROUP LIST",
                status: true,
                code: 200,
                statusCode: 1,
                data: response.slice(startIndex, endIndex)
            }
        )

        // }



        // console.log("remainingData::-", remainingData);

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
        
        // groupChatRoom ma check karvanu user chhe ke nai
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

            const findGroup = await GroupChatRoom.find(
                {
                    users: {
                        $elemMatch: {
                            userId: userId
                        }
                    }
                }
            );
            console.log("findGroup::", findGroup);

            const response = [];
            for (const respData of findGroup) {
                // console.log("respData::", respData.groupId);

                const findChats = await GroupChat.find({ groupId: respData.groupId });
                // console.log("findChats::--:", findChats.length);

                const getGroupData = await Group.findOne({ _id: respData.groupId }).select({ 'group_name': 1, 'group_img': 1 })
                // console.log("getGroupData::", getGroupData);

                if (findChats.length == 0) {

                    const chatData = {
                        groupId: getGroupData._id,
                        groupName: getGroupData.group_name,
                        groupImage: getGroupData.group_img,
                        unReadCount: 0,
                        lastMsg: '',
                        lastMsgUsername: '',
                    }
                    response.push(chatData);

                } else {

                    for (const findChat of findChats) {

                        const chatDataLenght = findChat.chat
                        if (chatDataLenght.length == 0) {

                            const chatData = {
                                groupId: getGroupData._id,
                                groupName: getGroupData.group_name,
                                groupImage: getGroupData.group_img,
                                unReadCount: 0,
                                lastMsg: '',
                                lastMsgUsername: '',
                            }
                            response.push(chatData);

                        } else {

                            const chatMessage = findChat.chat;
                            const getLastMessage = chatMessage[chatMessage.length - 1];
                            console.log("chatMessage", chatMessage, "getLastMessage", getLastMessage);

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
                                groupId: getGroupData._id,
                                groupName: getGroupData.group_name,
                                groupImage: getGroupData.group_img,
                                unReadCount: unReadCount,
                                lastMsg: getLastMessage.message,
                                lastMsgUsername: getLastMessage.senderName,
                            }
                            response.push(chatData);

                        }

                    }

                }

            }

            res.status(status.OK).json(
                {
                    message: "GET GROUP CHAT SUCCESSFULLY",
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

exports.groupPostLikedList = async (req, res) => {
    try {

        let postId = req.params.postId;
        const findGroupPostData = await GroupPostLike.findOne({
            post_id: postId
        });
        console.log("findGroupPostData::", findGroupPostData);

        if (findGroupPostData == null) {

            res.status(status.NOT_FOUND).json({
                message: "Liked user Not Found!",
                status: true,
                code: 200,
                statusCode: 1,
                data: []
            })

        } else {

            const response = [];
            for (const respData of findGroupPostData.reqAuthId) {

                const getUserData = await User.findOne({
                    _id: respData._id
                });

                const userData = {
                    user_id: respData._id,
                    profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
                    username: getUserData.username,
                    email: getUserData.email
                }
                response.push(userData)
            }

            res.status(status.OK).json(
                {
                    message: "Get Liked User Data List From Group Post Successfully",
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

exports.memberList = async (req, res) => {
    try {

        const findGroupMember = await GroupMemberList.find({ group_id: req.params.groupId })
        console.log("findGroupMember", findGroupMember);

        if (findGroupMember[0] == undefined) {

            res.status(status.NOT_FOUND).json({
                message: "Group Member Not Found!",
                status: true,
                code: 200,
                statusCode: 1,
                data: []
            })

        } else {

            res.status(status.OK).json(
                {
                    message: "Get Group Member Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: findGroupMember
                }
            )

        }

    } catch (error) {

        console.log("memberList--Error::", error);
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