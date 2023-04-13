const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const activity_schema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref : 'auth'
    },
    activity_type: {
        type: Number, // 1-Running/Walking, 2-Cycling, 3-Driving
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    distance: {
        type: String,
        required: true
    },
    calories: {
        type: String
    },
    steps: {
        type: String
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    vehicle_id: {
        type: String
    },
    map_image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'activity'
})

module.exports = mongoose.model('activity', activity_schema);
