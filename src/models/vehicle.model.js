const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const vehicleSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref: 'auth'
    },
    vehicle_img_id: {
        type: ObjectId,
        required: true
    },
    vehicle_type: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    trim: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    daily_driving: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
}, {
    collection: 'vehicles'
});

module.exports = mongoose.model('vehicles', vehicleSchema);