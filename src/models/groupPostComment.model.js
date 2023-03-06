const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const groupPostCommentSchema = mongoose.Schema({
    post_id: {
        type: ObjectId,
        ref: 'groupPost',
        required: true
    },
    group_id: {
        type: ObjectId,
        ref: "group",
        required: true
    },
    user_id: {
        type: String,
        ref: "auth",
        required: true
    },
    user_img: {
        type: Array,
        ref: "auth",
        required: true
    },
    user_name: {
        type: String,
        ref: "auth",
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'groupPostComment'
});

module.exports = mongoose.model('groupPostComment', groupPostCommentSchema);