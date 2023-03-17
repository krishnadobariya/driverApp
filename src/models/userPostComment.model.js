const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const userPostCommentSchema = mongoose.Schema({
    post_id: {
        type: ObjectId,
        ref: 'groupPost',
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
    collection: 'userPostComment'
});

module.exports = mongoose.model('userPostComment', userPostCommentSchema);