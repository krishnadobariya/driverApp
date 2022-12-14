const mongoose = require("mongoose");
const { array } = require("../utils/multer.photo");

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
        default: "Active"
    },
    password: {
        type: String,
        required: true
    },
    fcm_token: {
        type: String,
        required: true
    },
    vehicle: {
        type: Array,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'auth'
});

module.exports = mongoose.model('auth', authSchema);
