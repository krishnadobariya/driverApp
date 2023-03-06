const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const groupPostSchema = mongoose.Schema({
    group_id: {
        type: ObjectId,
        ref: 'group',
        required: true
    },
    user_id: {
        type: ObjectId,
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
    desc: {
        type: String,
        required: true
    },
    image_video: {
        type: Array,
        required: true
    },
    like_count: {
        type: Number
    },
    comment_count: {
        type: Number
    },
    post_time: {
        type: String
    }
}, {
    timestamps: true
}, {
    collection: 'groupPost'
});

module.exports = mongoose.model('groupPost', groupPostSchema);