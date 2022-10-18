const mongoose = require("mongoose");

// Profile picture, name, age, sex, Type of vehicle they drive, Daily KM driving, Email, Phone num, password

const authSchema = mongoose.Schema({
    profile: {
        type: Array,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true
    },
    vehicleType: {
        type: Number,
        required: true
    },
    vehicleSubType:{
        type: String,
        required : true
    },
    dailyKM: {
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
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},{
    collection: 'auth'
});

module.exports = mongoose.model('auth', authSchema);
