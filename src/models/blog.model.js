const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const blogSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    thumbnail: {
        type: Array,
    },
    category: {
        type: String,
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'blogs'
});

module.exports = mongoose.model('blogs', blogSchema);