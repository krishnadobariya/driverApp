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
        type: String,
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
        type: Number,
        required: true
    },
    comment_count: {
        type: Number,
        required: true
    },
    post_time: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'groupPost'
});

module.exports = mongoose.model('groupPost', groupPostSchema);