const chatRoom = require("./models/chatRoom.model");
const chatModel = require("./models/chat.model");
const authModel = require("../models/auth.model");
const Notification = require("../helper/firebaseHelper");
const joinEvent = require("../models/joinEvent.model")
const mongoose = require("mongoose");

function socket(io) {
    console.log("SETUP :- Socket Loading....");

    io.on("connection", (socket) => {
        console.log("SETUP :- Socket Connected");
        console.log("New User Id :: " + socket.id);

        // ----- joinUser ----- //
        socket.on("joinUser", (arg) => {
            const userRoom = `User${arg.user_id}`;
            socket.join(userRoom)
        })
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

        })
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

        })

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



        })

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

        })
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

        })
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

        })

        // ----- End userStatus ----- //

    })

}

module.exports = socket
