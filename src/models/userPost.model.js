const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const userPostSchema = mongoose.Schema({
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
        default: 0
    },
    comment_count: {
        type: Number,
        default: 0
    },
    media_type: {
        type: Number, //1-Image 2-Video
        default: 0
    },
    post_time: {
        type: String
    }
}, {
    timestamps: true
}, {
    collection: 'userPost'
});

module.exports = mongoose.model('userPost', userPostSchema);