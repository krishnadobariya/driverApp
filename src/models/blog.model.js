const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const blogSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    user_profile: {
        type: String,
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
    },
    like: {
        type: Number,
        default: 0
    },
    comment: {
        type: Number,
        default: 0
    },
    media_type: {
        type: Number, //1-Image 2-Video
        default: 0
    },
    location: {
        type: Object,
        default: {
            type: "Point",
            coordinates: [0.0, 0.0],
        },
        index: '2dsphere'
    },
    address: {
        type: String
    }
}, {
    timestamps: true
}, {
    collection: 'blogs'
});

module.exports = mongoose.model('blogs', blogSchema);