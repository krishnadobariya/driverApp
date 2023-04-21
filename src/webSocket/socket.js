const mongoose = require("mongoose");
const cron = require("node-cron");
const chatRoom = require("./models/chatRoom.model");
const chatModel = require("./models/chat.model");
const authModel = require("../models/auth.model");
const NotificationModel = require("../models/notification.model");
const joinEvent = require("../models/joinEvent.model");
const Group = require("../models/group.model");
const GroupList = require("../models/groupList.model");
const GroupChatRoom = require("./models/groupChatRoom.model");
const GroupChat = require("./models/groupChat.model");
const GroupMemberList = require("../models/groupMemberList.model");
const FriendRequest = require("../models/frdReq.model");
const Notification = require("../helper/firebaseHelper");

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
            const userRoom = `User${userId}`;

            const getUserData = await authModel.findOne({ _id: userId });
            if (getUserData == null) {

                const response = {
                    message: "User Not Found",
                    status: 0
                }
                io.to(userRoom).emit("communityReceive", response);

            } else {
                const getGroupData = await Group.findOne({ _id: groupId });
                if (getGroupData == null) {

                    const response = {
                        message: "Group Not Found",
                        status: 0
                    }
                    io.to(userRoom).emit("communityReceive", response);

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

                    const response = {
                        message: "Notification Data",
                        status: 1,
                        id: saveData._id,
                        group_id: saveData.group_id,
                        user_id: saveData.user_id,
                        req_user_id: saveData.req_user_id ? saveData.req_user_id : "",
                        notification_msg: saveData.notification_msg,
                        notification_img: saveData.notification_img,
                        user_name: saveData.user_name,
                        notification_type: saveData.notification_type
                    }
                    io.to(userRoom).emit("communityReceive", response);

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


        // ----- acceptInvite  //
        socket.on("acceptInvite", async (arg) => {
            let groupId = arg.group_id;
            let userId = arg.user_id;
            let action = arg.action;
            const userRoom = `User${userId}`;

            if (action == 1) {

                const getGroupData = await Group.findOne({ _id: groupId }).select({ 'group_members': 1, 'group_type': 1 });
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

                /* Get Group Member List */
                const getUserData = await authModel.findOne({ _id: userId });
                const updateGroupChat = await GroupMemberList.updateOne(
                    {
                        group_id: groupId
                    },
                    {
                        $push: {
                            users: {
                                user_id: userId,
                                user_name: getUserData.username,
                                user_img: getUserData.profile[0] ? getUserData.profile[0].res : "",
                                user_type: 2 // 1-Admin 2-Normal
                            }
                        }
                    }
                );
                console.log("updateGroupChat::", updateGroupChat);
                /* End Get Group Member List */

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

                var updateData;
                if (getGroupData.group_type == 2) {
                    
                    const getNotificationData = await NotificationModel.findOne({
                        group_id: groupId,
                        user_id: userId
                    });
                    
                    if(getNotificationData.req_user_id != null)
                    {
                        updateData = await NotificationModel.findOneAndUpdate(
                            {
                                group_id: groupId,
                                req_user_id: userId
                            },
                            {
                                $set: {
                                    user_id: userId,
                                    req_user_id: null,
                                    notification_msg: "Accepted",
                                    notification_type: 3
                                }
                            }
                        )
                    }
                    else{
                        updateData = await NotificationModel.findOneAndUpdate(
                            {
                                group_id: groupId,
                                user_id: userId
                            },
                            {
                                $set: {
                                    notification_msg: "Accepted",
                                    notification_type: 3
                                }
                            },
                            {
                                new: true
                            }
                        );
                    }

                }
                else {
                    updateData = await NotificationModel.findOneAndUpdate(
                        {
                            group_id: groupId,
                            user_id: userId
                        },
                        {
                            $set: {
                                notification_msg: "Accepted",
                                notification_type: 3
                            }
                        },
                        {
                            new: true
                        }
                    );
                }

                if (updateData != null) {
                    const response = {
                        message: "Invite Accept",
                        status: 1,
                        id: updateData._id,
                        group_id: updateData.group_id,
                        user_id: updateData.user_id,
                        req_user_id: updateData.req_user_id ? updateData.req_user_id : "",
                        notification_msg: updateData.notification_msg,
                        notification_img: updateData.notification_img,
                        user_name: updateData.user_name,
                        notification_type: updateData.notification_type
                    }
                    io.to(userRoom).emit("communityReceive", response);
                }
                else {
                    console.log("Not called");
                    const response = {
                        message: "Notification data not updated",
                        status: 0
                    }
                    io.to(userRoom).emit("communityReceive", response);
                }

            } else if (action == 2) {

                const rejectInvite = await NotificationModel.deleteOne(
                    {
                        group_id: groupId,
                        user_id: userId
                    }
                );

                const getNotificationData = await NotificationModel.findOne({
                    group_id: groupId,
                    user_id: userId
                });

                const response = {
                    message: "Invite Reject",
                    status: 1,
                    id: getNotificationData._id,
                    group_id: getNotificationData.group_id,
                    user_id: getNotificationData.user_id,
                    req_user_id: getNotificationData.req_user_id ? getNotificationData.req_user_id : "",
                    notification_msg: getNotificationData.notification_msg,
                    notification_img: getNotificationData.notification_img,
                    user_name: getNotificationData.user_name,
                    notification_type: getNotificationData.notification_type
                }
                io.to(userRoom).emit("communityReceive", response);

            }

        });
        // ----- End acceptInvite ----- //


        // ----- joinGroup ----- //
        socket.on("joinGroup", async (arg) => {

            let groupId = arg.group_id;
            let userId = arg.user_id;

            const userRoom = `User${userId}`;

            if (arg.group_type == 1) {

                const getGroupData = await Group.findOne({ _id: groupId }).select('group_members');
                if (getGroupData == null) {
                    io.emit("groupJoin", "Group Not Found");
                } else {

                    // add group memenber + 1
                    const addMemenber = parseInt(getGroupData.group_members) + 1;
                    console.log("addMemenber::", addMemenber);
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

                    /* Get Group Member List */
                    const getUserData = await authModel.findOne({ _id: userId });
                    const updateGroupChat = await GroupMemberList.updateOne(
                        {
                            group_id: groupId
                        },
                        {
                            $push: {
                                users: {
                                    user_id: userId,
                                    user_name: getUserData.username,
                                    user_img: getUserData.profile[0] ? getUserData.profile[0].res : "",
                                    user_type: 2 // 1-Admin 2-Normal
                                }
                            }
                        }
                    );
                    /* End Get Group Member List */

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



                    io.emit("groupJoin", "Group Not Found");
                }

            }

            if (arg.group_type == 2) {

                const findGroup = await Group.findOne({ _id: groupId });
                if (findGroup == null) {

                    const response = {
                        message: "Group Not Found",
                        status: 0
                    }
                    io.to(userRoom).emit("communityReceive", response);

                } else {
                    const findUser = await authModel.findOne({ _id: userId });

                    if (findUser == null) {

                        const response = {
                            message: "User Not Found",
                            status: 0
                        }
                        io.to(userRoom).emit("communityReceive", response);

                    } else {

                        console.log('else---part-----');
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

                        const response = {
                            message: "Notification Data",
                            status: 1,
                            id: saveData._id,
                            group_id: saveData.group_id,
                            user_id: saveData.user_id,
                            req_user_id: saveData.req_user_id ? saveData.req_user_id : "",
                            notification_msg: saveData.notification_msg,
                            notification_img: saveData.notification_img,
                            user_name: saveData.user_name,
                            notification_type: saveData.notification_type
                        }
                        io.to(userRoom).emit("communityReceive", response);

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

            const findGroup = await GroupChat.findOne({ groupId: arg.groupId }); // For Group Chat
            const getUserData = await authModel.findOne({ _id: arg.sender_id }); // For User

            const getMemberList = await GroupMemberList.findOne({ group_id: arg.groupId });

            if (findGroup == null) {

                if (getUserData == null) {
                    console.log("getUserData--null");
                } else {

                    if (getMemberList == null) {
                        io.emit('messageYou', 'You are not a member of the group');
                    } else {

                        const addGroupChatData = GroupChat({
                            // chatRoomId: arg.chatRoomId,
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

                        const updateChat = await GroupChat.updateOne(
                            {
                                groupId: arg.groupId
                            },
                            {
                                $push: {
                                    "chat.$[].read": {
                                        reader: arg.sender_id,
                                        readerName: getUserData.username
                                    }
                                }
                            }
                        )

                        console.log("saveData:::----", saveData);

                        for (const userData of getMemberList.users) {
                            console.log("userData:::", userData.user_id);

                            if (userData.user_id == arg.sender_id) {
                                console.log("Condition:::---", userData.user_id == arg.sender_id);
                            } else {

                                const emitUserId = `User${userData.user_id}`;

                                const response = {
                                    sender: arg.sender_id,
                                    user_name: getUserData.username,
                                    message: arg.message
                                }

                                io.to(emitUserId).emit('messageYou', response);

                                const getUserToken = await authModel.findOne({ _id: userData.user_id }).select('fcm_token');

                                const title = `${arg.groupName}`;
                                const body = `${getUserData.username} Send ${arg.message}`;
                                const text = arg.message;
                                const sendBy = JSON.stringify(userData.user_id);
                                const registrationToken = getUserToken.fcm_token
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

                const updateChat = await GroupChat.updateOne(
                    {
                        groupId: arg.groupId
                    },
                    {
                        $push: {
                            "chat.$[].read": {
                                reader: arg.sender_id,
                                readerName: getUserData.username
                            }
                        }
                    }
                )

                for (const userData of getMemberList.users) {
                    console.log("userData:::", userData);

                    if (userData.user_id == arg.sender_id) {
                        console.log("Condition:::---", userData.user_id == arg.sender_id);
                    } else {

                        const emitUserId = `User${userData.user_id}`;

                        const response = {
                            sender: arg.sender_id,
                            user_name: getUserData.username,
                            message: arg.message
                        }

                        io.to(emitUserId).emit('messageYou', response);

                        const getUserToken = await authModel.findOne({ _id: userData.user_id }).select('fcm_token');

                        const title = `${arg.groupName}`;
                        const body = `${getUserData.username} Send ${arg.message}`;
                        const text = arg.message;
                        const sendBy = JSON.stringify(userData.user_id);
                        const registrationToken = getUserToken.fcm_token
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
        // ----- End groupChat ----- //


        // ----- groupChatReadUnread ----- //
        socket.on("groupChatReadUnread", async (arg) => {

            let userId = arg.userId;
            let groupId = arg.groupId;
            const userRoom = `User${userId}`;

            const findUser = await authModel.findOne({ _id: userId });
            if (findUser == null) {
                io.to(userRoom).emit("groupReadChat", "User Not Found");
            } else {

                const findGroupMember = await GroupMemberList.findOne({
                    group_id: groupId,
                    users: {
                        $elemMatch: {
                            user_id: userId
                        }
                    }
                });
                console.log("findGroupMember:::", findGroupMember);

                if (findGroupMember == null) {
                    io.to(userRoom).emit("groupReadChat", "Group ChatRoom Not Found");
                } else {

                    const findChatRoom = await GroupChat.findOne({ groupId: groupId });
                    if (findChatRoom == null) {
                        io.to(userRoom).emit("groupReadChat", "You are not a member of the group");
                    } else {

                        console.log("--aSagdsck--");
                        const updateChat = await GroupChat.updateOne(
                            {
                                groupId: groupId
                            },
                            {
                                $push: {
                                    "chat.$[].read": {
                                        reader: userId,
                                        readerName: findUser.username
                                    }
                                }
                            }
                        )
                        io.to(userRoom).emit("groupReadChat", "Chat Has Been Read");

                    }

                }

            }

        });
        // ----- groupChatReadUnread ----- //


        socket.on("mapOnline", async (arg) => {

            let userId = arg.userId;
            let minutes = arg.time;

            const startTime = new Date().toISOString().slice(0, 19);;
            const endTime = new Date(new Date().getTime() + minutes * 60000).toISOString().slice(0, 19);;

            const insertData = await authModel.findByIdAndUpdate(
                {
                    _id: userId
                },
                {
                    $set: {
                        start_time: startTime,
                        end_time: endTime
                    }
                }
            );

        });

        // ----- friendRequest ----- //
        socket.on("friendRequest", async (arg) => {

            const userId = arg.user_id;
            const userRoom = `User${userId}`;
            const reqUserId = arg.req_user_id;

            const findUserData = await authModel.findOne({ _id: userId });

            if (findUserData) {

                const findRequestUser = await authModel.findOne({ _id: reqUserId });

                if (findRequestUser) {

                    const sendFriendRequest = FriendRequest({
                        user_id: userId,
                        user_img: findUserData.profile[0] ? findUserData.profile[0].res : "",
                        user_name: findUserData.username,
                        requested_user_id: reqUserId,
                        requested_user_img: findRequestUser.profile[0] ? findRequestUser.profile[0].res : "",
                        requested_user_name: findRequestUser.username,
                    });
                    const saveData = await sendFriendRequest.save();


                    const insertNotifi = NotificationModel({
                        user_id: reqUserId,
                        req_user_id: userId,
                        notification_msg: 'following request',
                        notification_img: findUserData.profile[0] ? findUserData.profile[0].res : "",
                        user_name: findUserData.username,
                        notification_type: 5
                    });
                    const saveNotiData = await insertNotifi.save();

                    const respnse = {
                        userId: userId,
                        reqUserId: reqUserId,
                        userName: findUserData.username,
                        requestedUserName: findRequestUser.username
                    }

                    io.to(userRoom).emit("followRequest", respnse)

                    const title = `Request Send`;
                    const body = `Following Request Send By ${findUserData.username}`;
                    const text = 'User Requested';
                    const sendBy = reqUserId;
                    const registrationToken = findRequestUser.fcm_token;
                    Notification.sendPushNotificationFCM(
                        registrationToken,
                        title,
                        body,
                        text,
                        sendBy,
                        true
                    );

                } else {

                    const response = {
                        message: "RequestedUser Not Exist",
                        status: 0
                    }
                    io.to(userRoom).emit("followRequest", response)

                }

            } else {

                const response = {
                    message: "User Not Exist",
                    status: 0
                }
                io.to(userRoom).emit("followRequest", response);

            }

        })
        // ----- friendRequest ----- //


        //frdreqaccept ->  
        // accept thay atle frdRequest na table ma status change
        // sender ne notification mlavi joiye
        // notification na table ma change avse --> old entry delete 

        socket.on('friendReqAccept', async (arg) => {

            const userId = arg.user_id;
            const reqUserId = arg.req_user_id;
            const userRoom = `User${userId}`;
            const action = arg.action;

            if (action == 1) {

                const getUserData = await authModel.findOne({ _id: userId });

                const updateStatus = await FriendRequest.updateOne(
                    {
                        user_id: userId,
                        requested_user_id: reqUserId
                    },
                    {
                        $set: {
                            status: 2
                        }
                    }
                );

                const updateNotification = await NotificationModel.deleteOne(
                    {
                        user_id: reqUserId,
                        req_user_id: userId,
                    }
                );

                const getReqUserData = await authModel.findOne({ _id: reqUserId });
                const insertNotifi = NotificationModel({
                    user_id: userId,
                    req_user_id: reqUserId,
                    notification_msg: 'Request Accepted',
                    notification_img: getReqUserData.profile[0] ? getReqUserData.profile[0].res : "",
                    user_name: getReqUserData.username,
                    notification_type: 6
                });
                const saveData = await insertNotifi.save();

                io.to(userRoom).emit("followRequest", `Request Accept By ${reqUserId}`)

                const title = `Request Accepted`;
                const body = `Request Accept By ${reqUserId}`;
                const text = 'Request Accepted';
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

            } else {

                const deleteNotification = await NotificationModel.deleteOne(
                    {
                        user_id: reqUserId,
                        req_user_id: userId,
                    }
                );
                // console.log("deleteNotification", deleteNotification);

                const deleteFriendRequest = await FriendRequest.deleteOne(
                    {
                        user_id: userId,
                        requested_user_id: reqUserId
                    }
                );
                // console.log("deleteFriendRequest", deleteFriendRequest);

                io.to(userRoom).emit("followRequest", `Request Reject By ${reqUserId}`)

            }

        })

    })

}

module.exports = socket
