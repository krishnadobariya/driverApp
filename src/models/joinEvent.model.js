const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const joinEventSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "auth"
    },
    event_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "events"
    },
    username: {
        type: String,
        required: true
    },
    user_profile: {
        type: String,
        required: true
    },
    user_age: {
        type: String,
        required: true
    },
    user_gender: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'joinEvent'
});

module.exports = mongoose.model('joinEvent', joinEventSchema);