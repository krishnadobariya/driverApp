const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const userPostLikeSchema = mongoose.Schema({
    post_id: {
        type: ObjectId,
        ref: 'groupPost',
        required: true
    },
    reqAuthId: [{
        _id: {
            type: ObjectId,
            ref: 'auth',
            required: true
        }
    }],
    user_img: {
        type: String,
        ref: "auth",
        required: true
    },
    user_name: {
        type: String,
        ref: "auth",
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'userPostLike'
});

module.exports = mongoose.model('userPostLike', userPostLikeSchema);