const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const blockUnblockSchema = mongoose.Schema({

    user_id: {
        type: ObjectId,
        required: true
    },
    block_user_id: {
        type: ObjectId,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_img: {
        type: String,
        required: true
    },
    block: {
        type: Number, //1-block 2-unblock
        required: true
    }

}, {
    timestamps: true
}, {
    collection: 'blockUnblock'
});

module.exports = mongoose.model('blockUnblock', blockUnblockSchema);