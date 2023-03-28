const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const frdReqSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    user_img: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    requested_user_id: {
        type: ObjectId,
        required: true
    },
    requested_user_img: {
        type: String,
        required: true
    },
    requested_user_name: {
        type: String,
        required: true
    },
    status: {
        type: Number,   // 1- Pending, 2- Accepted
        default: 1
    }
}, {
    timestamps: true
}, {
    collection: 'friendRequest'
});

module.exports = mongoose.model('friendRequest', frdReqSchema);