const chatRoom = require("./models/chatRoom.model");
const chatModel = require("./models/chat.model");
const authModel = require("../models/auth.model");
const NotificationModel = require("../models/notification.model");
const joinEvent = require("../models/joinEvent.model");
const Group = require("../models/group.model");
const GroupList = require("../models/groupList.model");
const GroupChatRoom = require("./models/groupChatRoom.model");
const GroupChat = require("./models/groupChat.model");
const Notification = require("../helper/firebaseHelper");

const mongoose = require("mongoose");
const { findByIdAndUpdate, updateOne } = require("./models/chatRoom.model");

function socket(io) {
    console.log("SETUP :- Socket Loading....");

    io.on("connection", (socket) => {
        console.log("SETUP :- Socket Connected");
        console.log("New User Id :: " + socket.id);

        // ----- joinUser ----- //
        socket.on("joinUser", (arg) => {
            const userRoom = `User${arg.user_id}`;
            socket.join(userRoom)
        });
        // ----- joinUser ----- //


        // ----- chat ----- //
        socket.on("chat", async (arg) => {
            const userRoom = `User${arg.receiver_id}`;

            const findUserForNotiy = await authModel.findOne({
                _id: arg.receiver_id
            })

            const checkUser1 = await chatRoom.findOne(
                {
                    user1: arg.sender_id,
                    user2: arg.receiver_id
                }
            ).select('user1 , user2').lean();
            console.log("checkUser1::", checkUser1);

            const checkUser2 = await chatRoom.findOne(
                {
                    user1: arg.receiver_id,
                    user2: arg.sender_id
                }
            ).select('user1 , user2').lean();
            console.log("checkUser2::", checkUser2);

            if (checkUser1 == null && checkUser2 == null) {

                const createChatRoom = await chatRoom({
                    user1: arg.sender_id,
                    user2: arg.receiver_id
                });
                const saveData = await createChatRoom.save();

                const getChatRoom = await chatRoom.findOne({
                    user1: arg.sender_id,
                    user2: arg.receiver_id
                }).select('user1, user2').lean();
                console.log("getChatRoom::", getChatRoom);

                const getChatRoom2 = await chatRoom.findOne({
                    user1: arg.receiver_id,
                    user2: arg.sender_id
                }).select('user1, user2').lean();

                if (getChatRoom == null && getChatRoom2 == null) {

                } else {

                    if (getChatRoom) {

                        const addDataInChat = await chatModel({
                            chatRoomId: getChatRoom._id,
                            chat: {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }
                        });
                        console.log("addDataInChat::", addDataInChat);

                        const saveChatData = await addDataInChat.save();
                        console.log("saveChatData::", saveChatData);

                        const response = {
                            sender: arg.sender_id,
                            receiver: arg.receiver_id,
                            message: arg.message
                        }

                        io.to(userRoom).emit("chatReceive", response)


                        if (findUserForNotiy.fcm_token) {
                            const title = `${findUserForNotiy.username}`;
                            const body = `${arg.message}`;
                            const text = arg.message;
                            const sendBy = arg.sender_id;
                            const registrationToken = findUserForNotiy.fcm_token
                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }
                    } else {

                        const addDataInChat = await chatModel({
                            chatRoomId: getChatRoom2._id,
                            chat: {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }
                        });
                        console.log("addDataInChatElsePart::", addDataInChat);

                        const saveChatData = await addDataInChat.save();
                        console.log("saveChatData::", saveChatData);

                        const response = {
                            sender: arg.sender_id,
                            receiver: arg.receiver_id,
                            message: arg.message
                        }

                        io.to(userRoom).emit("chatReceive", response)

                        if (findUserForNotiy.fcm_token) {
                            const title = `${findUserForNotiy.username}`;
                            const body = `${arg.message}`;
                            const text = arg.message;
                            const sendBy = arg.sender_id;
                            const registrationToken = findUserForNotiy.fcm_token;

                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }

                    }

                }




            } else {

                const getChatRoom = await chatRoom.findOne({
                    user1: arg.sender_id,
                    user2: arg.receiver_id
                }).select('user1, user2').lean();
                console.log("getChatRoom::", getChatRoom);

                const getChatRoom2 = await chatRoom.findOne({
                    user1: arg.receiver_id,
                    user2: arg.sender_id
                }).select('user1, user2').lean();
                console.log("getChatRoom2::", getChatRoom2);

                if (getChatRoom == null && getChatRoom2 == null) {

                } else {

                    if (getChatRoom) {

                        const findChatRoom = await chatModel.findOne({
                            chatRoomId: getChatRoom._id
                        }).lean();
                        console.log("findChatRoom::", findChatRoom);

                        if (findChatRoom == null) {

                            const addDataInChat = await chatModel({
                                chatRoomId: getChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    receiver: arg.receiver_id,
                                    message: arg.message
                                }
                            });
                            console.log("addDataInChat::", addDataInChat);

                            const saveChatData = await addDataInChat.save();
                            console.log("saveChatData::", saveChatData);

                            const response = {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }

                            io.to(userRoom).emit("chatReceive", response)

                            if (findUserForNotiy.fcm_token) {
                                const title = `${findUserForNotiy.username}`;
                                const body = `${arg.message}`;
                                const text = arg.message;
                                const sendBy = arg.sender_id;
                                const registrationToken = findUserForNotiy.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );
                            }

                        } else {

                            const chatData = {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }

                            const updateChat = await chatModel.updateOne(
                                {
                                    chatRoomId: getChatRoom._id
                                },
                                {
                                    $push: {
                                        chat: chatData
                                    }
                                }
                            )
                            console.log("updateChat..");

                            const getChatData = await chatModel.findOne(
                                {
                                    chatRoomId: getChatRoom._id
                                }
                            )
                            console.log("getChatData::", getChatData);

                            const response = {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }

                            io.to(userRoom).emit("chatReceive", response)

                            if (findUserForNotiy.fcm_token) {
                                const title = `${findUserForNotiy.username}`;
                                const body = `${arg.message}`;
                                const text = arg.message;
                                const sendBy = arg.sender_id;
                                const registrationToken = findUserForNotiy.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );
                            }

                        }



                    } else {

                        const findChatRoom2 = await chatModel.findOne({
                            chatRoomId: getChatRoom2._id
                        }).lean();
                        console.log("findChatRoom2::", findChatRoom2);

                        if (findChatRoom2 == null) {

                            const addDataInChat = await chatModel({
                                chatRoomId: getChatRoom2._id,
                                chat: {
                                    sender: arg.sender_id,
                                    receiver: arg.receiver_id,
                                    message: arg.message
                                }
                            });
                            console.log("addDataInChatElsePart::", addDataInChat);

                            const saveChatData = await addDataInChat.save();
                            console.log("saveChatData::", saveChatData);

                            const response = {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }

                            io.to(userRoom).emit("chatReceive", response)

                            if (findUserForNotiy.fcm_token) {
                                const title = `${findUserForNotiy.username}`;
                                const body = `${arg.message}`;
                                const text = arg.message;
                                const sendBy = arg.sender_id;
                                const registrationToken = findUserForNotiy.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );
                            }

                        } else {

                            const chatData = {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }

                            const updateChat = await chatModel.updateOne(
                                {
                                    chatRoomId: getChatRoom2._id
                                },
                                {
                                    $push: {
                                        chat: chatData
                                    }
                                }
                            )
                            console.log("updateChatElse..");

                            const getChatData2 = await chatModel.findOne(
                                {
                                    chatRoomId: getChatRoom2._id
                                }
                            )
                            console.log("getChatData2::", getChatData2);

                            const response = {
                                sender: arg.sender_id,
                                receiver: arg.receiver_id,
                                message: arg.message
                            }

                            io.to(userRoom).emit("chatReceive", response)

                            if (findUserForNotiy.fcm_token) {
                                const title = `${findUserForNotiy.username}`;
                                const body = `${arg.message}`;
                                const text = arg.message;
                                const sendBy = arg.sender_id;
                                const registrationToken = findUserForNotiy.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );
                            }

                        }

                    }

                }

            }

        });
        // ----- End chat ----- //


        // ----- readUnread ----- //
        /*
        socket.on("readUnread", async (arg) => {

            const userRoom = `User${arg.receiver_id}`
            console.log("arg::", arg);
            const findChatRoom = await chatModel.findOne(
                {
                    chatRoomId: arg.chat_room_id,
                    // "chat.sender": arg.sender_id
                    "chat.receiver": arg.receiver_id
                }
            );
            console.log("findChatRoom::", findChatRoom);

            if (findChatRoom == null) {

                io.to(userRoom).emit("readChat", "ChatRoom Not Found")

            } else {
                console.log("enter1");
                for (const getSenderChat of findChatRoom.chat) {
                    console.log("");

                    const updateReadValue = await chatModel.updateOne(
                        {
                            chatRoomId: arg.chat_room_id,
                            chat: {
                                $elemMatch: {
                                    receiver: mongoose.Types.ObjectId(arg.receiver_id)
                                }
                            }
                        },
                        {
                            $set: {
                                "chat.$[chat].read": 0
                            }
                        },
                        {
                            arrayFilters: [
                                {
                                    // 'chat.sender': mongoose.Types.ObjectId(arg.sender_id)
                                    'chat.receiver': mongoose.Types.ObjectId(arg.receiver_id)
                                }
                            ]
                        }
                    );

                }

                io.to(userRoom).emit("readChat", "Chat Has Been Read")

            }


        })
        */

        socket.on("readUnread", async (arg) => {

            const userRoom = `User${arg.user_id}`;
            console.log("userRoom::", userRoom);

            const findChatRoom = await chatModel.findOne({
                chatRoomId: arg.chat_room_id,
                "chat.receiver": arg.user_id
            });
            console.log("findChatRoom::", findChatRoom);

            if (findChatRoom == null) {
                io.to(userRoom).emit("readChat", "ChatRoom Not Found");
            } else {

                for (const [key, getSenderChat] of findChatRoom.chat.entries()) {
                    if ((getSenderChat.receiver).toString() == (arg.user_id).toString()) {
                        const updateRead = await chatModel.updateOne(
                            {
                                chatRoomId: arg.chat_room_id,
                                chat: {
                                    $elemMatch: {
                                        receiver: mongoose.Types.ObjectId(arg.user_id)
                                    }
                                }
                            }, {
                            $set: {
                                "chat.$[chat].read": 0
                            }
                        }, {
                            arrayFilters: [{
                                'chat.receiver': mongoose.Types.ObjectId(arg.user_id)
                            }]
                        }
                        )
                    }
                }

                io.to(userRoom).emit("readChat", "Chat Has Been Read")

            }

        });
        // ----- End readUnread ----- //


        // ----- updateLatLong ----- //
        socket.on("updateLatLong", async (arg) => {


            const userId = await authModel.findOne({
                _id: arg.user_id
            })

            console.log(userId);

            if (userId) {

                await authModel.updateOne({
                    _id: arg.user_id
                }, {
                    $set: {
                        location: {
                            type: "Point",
                            coordinates: [
                                parseFloat(arg.longitude),
                                parseFloat(arg.latitude),
                            ],
                        },
                    }
                })
                const data = {
                    user_id: arg.user_id,
                    longitude: arg.longitude,
                    latitude: arg.latitude
                }
                io.emit("updateLatLongSuccess", data)
            } else {
                io.emit("updateLatLongSuccess", "User Not Found!")
            }



        });
        // ----- End readUnread ----- //

        // ----- isJoin ----- //
        socket.on("isJoin", async (arg) => {

            let userId = arg.user_id;
            let eventId = arg.event_id;
            console.log("Arg-Data", userId, eventId);

            const getUserData = await authModel.findOne({ _id: userId });
            console.log("getUserData::", getUserData);

            const registerData = new joinEvent({
                user_id: userId,
                event_id: eventId,
                username: getUserData.username,
                user_profile: getUserData.profile[0] ? getUserData.profile[0].res : "",
                user_age: getUserData.age,
                user_gender: getUserData.gender
            })
            const saveData = await registerData.save();

        });
        // ----- isJoin ----- //5876


        // ----- updateStatus ----- //
        socket.on("updateStatus", async (arg) => {

            let userId = arg.user_id;
            let status = arg.status;

            const updateStatus = await authModel.updateOne({
                _id: userId
            }, {
                $set: {
                    status: status
                }
            })

        });
        // ----- End updateStatus ----- //


        // ----- userStatus ----- //
        /*
        socket.on("userStatus", async (arg) => {

            let userId = arg.user_id;

            const findUserData = await authModel.findOne({
                _id: userId
            });
            console.log("findUserData::", findUserData);

            if (findUserData.status == 'Active') {
                io.emit("getStatus", 1)
            } else {
                io.emit("getStatus", 0)
            }

        })
        */

        socket.on("userStatus", async (arg) => {

            let userId = arg.user_id;
            const userRoom = `User${arg.user_id}`;

            const findUserData = await authModel.findOne({
                _id: userId
            });
            console.log("findUserData::", findUserData);

            if (findUserData.status == 'Active') {
                io.to(userRoom).emit("getStatus", 1)
            } else {
                io.to(userRoom).emit("getStatus", 0)
            }

        });
        // ----- End userStatus ----- //


        // ----- inviteGroup ----- //
        socket.on("inviteGroup", async (arg) => {

            let userId = arg.user_id;
            let groupId = arg.group_id;

            const getUserData = await authModel.findOne({ _id: userId });
            if (getUserData == null) {

                io.emit("User Not Found");

            } else {
                const getGroupData = await Group.findOne({ _id: groupId });
                if (getGroupData == null) {

                    io.emit("Group Not Found");

                } else {

                    const insertData = NotificationModel({
                        group_id: groupId,
                        user_id: userId,
                        notification_msg: "User Invited",
                        notification_img: arg.notification_img,
                        user_name: arg.user_name,
                        notification_type: 1
                    })
                    const saveData = await insertData.save();

                    const title = `Invited you!`;
                    const body = `You're invited for this ${getGroupData.group_name}`;
                    const text = 'User Invited';
                    const sendBy = userId;
                    const registrationToken = getUserData.fcm_token;

                    Notification.sendPushNotificationFCM(
                        registrationToken,
                        title,
                        body,
                        text,
                        sendBy,
                        true
                    );

                }
            }
        });
        // ----- End inviteGroup ----- //


        // ----- acceptInvite ----- //
        socket.on("acceptInvite", async (arg) => {
            let groupId = arg.group_id;
            let userId = arg.user_id;
            let action = arg.action;

            if (action == 1) {

                const getGroupData = await Group.findOne({ _id: groupId }).select('group_members');
                const addMemenber = parseInt(getGroupData.group_members) + 1;
                const updateGroupData = await Group.findByIdAndUpdate(
                    {
                        _id: groupId
                    },
                    {
                        $set: {
                            group_members: addMemenber
                        }
                    },
                    {
                        new: true
                    }
                );
                console.log("updateGroupData:::", updateGroupData);
                // add group memenber + 1        
                console.log("getGroupData:::---", getGroupData);
                const addData = GroupList({
                    group_id: groupId,
                    user_id: userId,
                    group_img: updateGroupData.group_img,
                    group_name: updateGroupData.group_name,
                    group_type: updateGroupData.group_type,
                    group_members: addMemenber
                });
                const saveData = await addData.save();
                console.log("saveData:::", saveData);

                const getChatRoomData = await GroupChatRoom.findOne({ groupId: groupId });
                console.log("getChatRoomData::", getChatRoomData);
                if (getChatRoomData == null) {

                    const joinOnRoom = GroupChatRoom({
                        groupId: groupId,
                        groupName: updateGroupData.group_name,
                        users: {
                            userId: userId
                        }
                    });
                    const createRoom = await joinOnRoom.save();
                    console.log("createRoom:::", createRoom);

                } else {

                    const updateRoom = await GroupChatRoom.updateOne(
                        {
                            groupId: groupId
                        },
                        {
                            $push: {
                                users: {
                                    userId: userId
                                }
                            }
                        }
                    )

                }

                const updateData = await NotificationModel.updateOne(
                    {
                        group_id: groupId,
                        user_id: userId
                    },
                    {
                        $set: {
                            notification_msg: "Accepted",
                            notification_type: 3
                        }
                    }
                );
                io.emit("Invite Accept");

            } else if (action == 2) {

                const rejectInvite = await NotificationModel.deleteOne(
                    {
                        group_id: groupId,
                        user_id: userId
                    }
                );
                io.emit("Invite Reject");

            }

        });
        // ----- End acceptInvite ----- //


        // ----- joinGroup ----- //
        socket.on("joinGroup", async (arg) => {

            let groupId = arg.group_id;
            let userId = arg.user_id;

            if (arg.group_type == 1) {

                const getGroupData = await Group.findOne({ _id: groupId }).select('group_members');
                if (getGroupData == null) {
                    io.emit("Group Not Found");
                } else {

                    // add group memenber + 1
                    const addMemenber = parseInt(getGroupData.group_members) + 1;
                    const updateGroupData = await Group.findByIdAndUpdate(
                        {
                            _id: groupId
                        },
                        {
                            $set: {
                                group_members: addMemenber
                            }
                        },
                        {
                            new: true
                        }
                    );
                    console.log("updateGroupData:::", updateGroupData);
                    // add group memenber + 1        
                    console.log("getGroupData:::---", getGroupData);
                    const addData = GroupList({
                        group_id: groupId,
                        user_id: userId,
                        group_img: updateGroupData.group_img,
                        group_name: updateGroupData.group_name,
                        group_type: updateGroupData.group_type,
                        group_members: addMemenber
                    });
                    const saveData = await addData.save();
                    console.log("saveData:::", saveData);

                    const getChatRoomData = await GroupChatRoom.findOne({ groupId: groupId });
                    console.log("getChatRoomData::", getChatRoomData);
                    if (getChatRoomData == null) {

                        const joinOnRoom = GroupChatRoom({
                            groupId: groupId,
                            groupName: updateGroupData.group_name,
                            users: {
                                userId: userId
                            }
                        });
                        const createRoom = await joinOnRoom.save();
                        console.log("createRoom:::", createRoom);

                    } else {

                        const updateRoom = await GroupChatRoom.updateOne(
                            {
                                groupId: groupId
                            },
                            {
                                $push: {
                                    users: {
                                        userId: userId
                                    }
                                }
                            }
                        )

                    }

                }

            }

            if (arg.group_type == 2) {

                const findGroup = await Group.findOne({ _id: groupId });
                if (findGroup == null) {
                    io.emit("Group Not Found");
                } else {
                    const findUser = await authModel.findOne({ _id: userId });
                    if (findUser == null) {
                        io.emit("User Not Found");
                    } else {

                        const insertData = NotificationModel({
                            group_id: groupId,
                            user_id: findGroup.user_id,
                            req_user_id: userId,
                            notification_msg: "Join With Group",
                            notification_img: arg.notification_img,
                            user_name: arg.user_name,
                            notification_type: 2
                        });
                        const saveData = await insertData.save();

                        const title = `Join Group`;
                        const body = `${arg.user_name} sending you a request for join your group`;
                        const text = "Join With Group";
                        const sendBy = userId;
                        const registrationToken = findUser.fcm_token;
    
                        Notification.sendPushNotificationFCM(
                            registrationToken,
                            title,
                            body,
                            text,
                            sendBy,
                            true
                        );
                    }

                }

            }

        });
        // ----- End joinGroup ----- //


        // ----- groupChat ----- //
        socket.on("groupChat", async (arg) => {

            const findGroup = await GroupChat.findOne({ groupId: arg.groupId });
            const getUserData = await authModel.findOne({ _id: arg.sender_id });

            if (findGroup == null) {
                if (getUserData == null) {
                    console.log("getUserData--null");
                } else {

                    const addGroupChatData = GroupChat({
                        chatRoomId: arg.chatRoomId,
                        groupId: arg.groupId,
                        groupName: arg.groupName,
                        chat: {
                            sender: arg.sender_id,
                            senderName: getUserData.username,
                            senderImg: getUserData.profile[0] ? getUserData.profile[0].res : "",
                            message: arg.message
                        }
                    });
                    const saveData = await addGroupChatData.save();
                    console.log("saveData:::----", saveData);

                }

            } else {

                const updateGroupChat = await GroupChat.updateOne(
                    {
                        groupId: arg.groupId
                    },
                    {
                        $push: {
                            chat: {
                                sender: arg.sender_id,
                                senderName: getUserData.username,
                                senderImg: getUserData.profile[0] ? getUserData.profile[0].res : "",
                                message: arg.message
                            }
                        }
                    }
                );
                console.log("updateGroupChat:::----", updateGroupChat);

            }

        });
        // ----- End groupChat ----- //

    })

}

module.exports = socket
