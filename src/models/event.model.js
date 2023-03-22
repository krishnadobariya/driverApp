const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const eventSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    user_profile: {
        type: Array,
        required: true
    },
    event_photo: {
        type: Array,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    vehicle_type: {
        type: String,
        required: true
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
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    media_type: {
        type: Number, //1-Image 2-Video
        default: 0
    },
}, {
    timestamps: true
}, {
    collection: 'events'
});

module.exports = mongoose.model('events', eventSchema);