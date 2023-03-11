const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const groupChatSchema = mongoose.Schema({
    chatRoomId: {
        type: objectId,
        required: true,
        ref: 'groupChatRoom'
    },
    groupId: {
        type: objectId,
        required: true, 
    },
    groupName: {
        type: String,
        required: true, 
    },
    chat: [
        {
            sender: {
                type: objectId
            },
            message: {
                type: String
            },
            read: {
                type: Number,
                default: 0
            }
        }
    ]
}, {
    timestamps: true
}, {
    collection: 'groupChat'
})

module.exports = mongoose.model('groupChat', groupChatSchema);