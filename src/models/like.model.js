const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const likeSchema = mongoose.Schema({
    authId: {
        type: ObjectId,
        ref: 'auth',
        required: true
    },
    blogId: {
        type: ObjectId,
        ref: 'blogs',
        required: true
    },
    reqAuthId: [{
        _id: {
            type: ObjectId,
            ref: 'auth',
            required: true
        }
    }],
}, {
    timestamps: true
}, {
    collection: 'likes'
});

module.exports = mongoose.model('likes', likeSchema);
