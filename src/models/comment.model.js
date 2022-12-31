const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const commentSchema = mongoose.Schema({
    blog_id: {
        type: ObjectId,
        required: true
    },
    author_id: {
        type: ObjectId,
        required: true
    },
    comment:[{
        user_id:{
            type: ObjectId,
            required: true
        },
        text:{
            type : String
        }
    }]

}, {
    timestamps: true
}, {
    collection: 'comments'
});

module.exports = mongoose.model('comments', commentSchema);
