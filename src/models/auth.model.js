const mongoose = require("mongoose");

const authSchema = mongoose.Schema({
    profile: {
        type: Array,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    country_code: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    gender: {
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
    status: {
        type: String,
        required: true,
        default: "Offline"
    },
    user_type: {
        type: Number, //1-Public,2-Private
        required: true,
    },
    start_time: {
        type: String,
        required: true,
        default: "0000-00-00T00:00:00"
    },
    end_time: {
        type: String,
        required: true,
        default: "0000-00-00T00:00:00"
    },
    notification_time: {
        type: String,
        default: "0000-00-00T00:00:00"
    },
    password: {
        type: String,
        required: true
    },
    fcm_token: {
        type: String,
        required: true
    },
    vehicle: [
        {
            vehicle_img_id: {
                type: String
            },
            vehicle_type: {
                type: String
            },
            model: {
                type: String
            },
            trim: {
                type: String
            },
            year: {
                type: String
            },
            daily_driving: {
                type: String
            },
            unit: {
                type: String
            },
            duration: {
                type: String,
                default: '00:00:00'
            },
            distance: {
                type: String,
                default: '0'
            }
        }
    ]
}, {
    timestamps: true
}, {
    collection: 'auth'
});

module.exports = mongoose.model('auth', authSchema);