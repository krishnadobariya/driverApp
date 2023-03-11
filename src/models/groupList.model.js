const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const groupListSchema = mongoose.Schema({
    group_id: {
        type: ObjectId,
        required: true
    },
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
    group_type: {
        type: Number, // public - 1 / private - 2
        required: true
    },
    group_members: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'groupList'
});

module.exports = mongoose.model('groupList', groupListSchema);