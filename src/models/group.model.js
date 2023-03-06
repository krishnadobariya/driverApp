const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const groupSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    group_img: {
        type: String,
        required: true
    },
    group_name: {
        type: String,
        required: true
    },
    group_desc: {
        type: String,
        required: true
    },
    group_type: {
        type: Number, // public - 1 / private - 2
        required: true
    },
    group_members: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
}, {
    collection: 'group'
});

module.exports = mongoose.model('group', groupSchema);