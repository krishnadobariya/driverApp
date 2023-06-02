const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const matchUsers_schema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref : 'auth'
    },
    match_id_one: {
        type: ObjectId,
        default: null
    },
    match_id_two: {
        type: ObjectId,
        default: null
    },
    match_id_three: {
        type: ObjectId,
        default: null
    },
    match_id_four: {
        type: ObjectId,
        default: null
    },
    match_id_five: {
        type: ObjectId,
        default: null
    },
    credit: {
        type: String,
        default: null
    }
}, {
    timestamps: true
}, {
    collection: 'matchUsers'
})

module.exports = mongoose.model('matchUsers', matchUsers_schema);
