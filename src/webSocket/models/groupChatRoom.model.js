const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const groupChatRoomSchema = mongoose.Schema({
    groupId: {
        type: objectId,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    users: [
        {
            userId: {
                type: objectId
            }
        }
    ]
}, {
    timestamps: true
}, {
    collection: 'groupChatRoom'
});

module.exports = mongoose.model('groupChatRoom', groupChatRoomSchema);