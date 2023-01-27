const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const reportBlogSchema = mongoose.Schema({

    user_id: {
        type: ObjectId,
        required: true
    },
    blog_id: {
        type: ObjectId,
        required: true
    },
    message: {
        type: String,
        default: null
    }

}, {
    timestamps: true
}, {
    collection: 'reportBlog'
});

module.exports = mongoose.model('reportBlog', reportBlogSchema);