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
    comment:[{
        user_id:{
            type: ObjectId,
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
        text:{
            type : String
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'groupPostComment'
});

module.exports = mongoose.model('groupPostComment', groupPostCommentSchema);