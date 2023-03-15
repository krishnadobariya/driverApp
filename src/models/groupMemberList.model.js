const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const groupMemberListSchema = mongoose.Schema({
    group_id: {
        type: ObjectId,
        required: true
    },
    users: [
        {
            user_id: {
                type: ObjectId,
                required: true
            },
            user_name: {
                type: String,
                required: true
            },
            user_img: {
                type: String,
                required: true
            },
            user_type: {
                type: Number, // Admin - 1, Normal - 2
                required: true
            },
        }
    ]
}, {
    timestamps: true
}, {
    collection: 'groupMemberList'
});

module.exports = mongoose.model('groupMemberList', groupMemberListSchema);