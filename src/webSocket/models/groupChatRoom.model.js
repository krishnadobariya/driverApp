const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const groupChatRoomSchema = mongoose.Schema({
    user1: {
        type: objectId,
        required: true,
        ref: 'auth'
    },
    user2: {
        type: objectId,
        required: true,
        ref: 'auth'
    }
},{
    timestamps: true
},{
    collection: 'groupChatRoom'
});

module.exports = mongoose.model('groupChatRoom', groupChatRoomSchema);